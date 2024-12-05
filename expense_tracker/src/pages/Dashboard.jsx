import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const { accounts, transactions } = useContext(AppContext);
  const [currentMonthTransactions, setCurrentMonthTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalSelfTransfer, setTotalSelfTransfer] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startOfMonth && transactionDate <= today;
    });

    setCurrentMonthTransactions(filteredTransactions);

    const income = filteredTransactions
      .filter(transaction => transaction.transType === 'Income')
      .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);

    const expense = filteredTransactions
      .filter(transaction => transaction.transType === 'Expense' || transaction.transType === 'Loan Payment')
      .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);

    const selfTransfer = filteredTransactions
      .filter(transaction => transaction.transType === 'Self-Transfer')
      .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);

    const balance = accounts
      .filter(account => account.group === 'Cash' || account.group === 'Bank Account')
      .reduce((sum, account) => sum + (parseFloat(account.amount) || 0), 0);

    setTotalIncome(income);
    setTotalExpense(expense);
    setTotalSelfTransfer(selfTransfer);
    setTotalBalance(balance);
  }, [transactions, accounts]);
  const netSavings = totalIncome - totalExpense;

  const chartData = {
    labels: currentMonthTransactions.map(transaction => new Date(transaction.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Income',
        data: currentMonthTransactions.filter(transaction => transaction.transType === 'Income').map(transaction => transaction.amount),
        backgroundColor: 'green',
      },
      {
        label: 'Expenses',
        data: currentMonthTransactions.filter(transaction => transaction.transType === 'Expense' || transaction.transType === 'Loan payment').map(transaction => transaction.amount),
        backgroundColor: 'red',
      },
    ],
  };

  const getAmountStyle = (type) => {
    switch (type) {
      case 'Expense':
      case 'Loan Payment':
        return { color: 'red', fontFamily: 'Roboto Mono, monospace', fontWeight: '500', fontSize: '20px', textAlign: 'right' };
      case 'Income':
        return { color: '#21BA45', fontFamily: 'Roboto Mono, monospace', fontWeight: '500', fontSize: '20px', textAlign: 'right' };
      case 'Self-Transfer':
        return { color: 'blue', fontFamily: 'Roboto Mono, monospace', fontWeight: '500', fontSize: '20px', textAlign: 'right' };
      default:
        return {};
    }
  };

  const getAmountPrefix = (type) => {
    switch (type) {
      case 'Expense':
      case 'Loan Payment':
        return '-';
      case 'Income':
        return '+';
      default:
        return '';
    }
  };

  function getCurrentMonthYear() {
    const date = new Date();
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  return (
    <div>
        <h2 style={{textAlign:'center'}}>{getCurrentMonthYear()}</h2>
      <h2>Summary Cards</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <Card style={{ width: '18rem' }}>
          <Card.Body>
            <Card.Title>Total Balance</Card.Title>
            <Card.Text style={{ color: 'green' }}>+{totalBalance}</Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: '18rem' }}>
          <Card.Body>
            <Card.Title>Total Income</Card.Title>
            <Card.Text style={{ color: 'green' }}>+{totalIncome}</Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: '18rem' }}>
          <Card.Body>
            <Card.Title>Total Expenses</Card.Title>
            <Card.Text style={{ color: 'red' }}>-{totalExpense}</Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: '18rem' }}>
          <Card.Body>
            <Card.Title>Net Savings</Card.Title>
            <Card.Text>{netSavings}</Card.Text>
          </Card.Body>
        </Card>
      </div>

      <h2>Income vs. Expenses</h2>
      <div style={{ marginBottom: '20px' }}>
        <Bar data={chartData} />
      </div>

      <h2>Recent Transactions</h2>
      <Table>
        <thead>
          <tr>
            <th>From</th>
            <th>Amount</th>
            <th>To</th>
            <th>Date</th>
            <th>Note</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {currentMonthTransactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.from}</td>
              {/* <td style={{ textAlign: 'right', fontWeight: 'bold' }} >{transaction.amount}</td> */}
              <td style={getAmountStyle(transaction.transType)}>
                  {getAmountPrefix(transaction.transType)}{transaction.amount}
                </td>
              <td>{transaction.tag}</td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.note}</td>
              <td>{transaction.transType}</td>
            </tr>
          ))}
          <tr>
            <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Income:</td>
            <td style={{ color: 'green', fontWeight: '500', fontSize: '20px', textAlign: 'right', fontFamily: 'Roboto Mono, monospace'}}>+{totalIncome}</td>
          </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Self-Transfer:</td>
            <td style={{ color: 'blue', fontWeight: '500', fontSize: '20px', textAlign: 'right', fontFamily: 'Roboto Mono, monospace'}}>{totalSelfTransfer}</td>
          </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Expense:</td>
            <td style={{ color: 'red', fontWeight: '500', fontSize: '20px', textAlign: 'right' , fontFamily: 'Roboto Mono, monospace'}}>-{totalExpense}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default Dashboard;