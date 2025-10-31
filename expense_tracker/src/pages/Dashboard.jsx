import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

const Dashboard = () => {
  const { transactions, accounts, currentUser } = useContext(AppContext);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalBalance: 0,
    accountBalances: [],
    recentTransactions: [],
    expensesByCategory: {},
    monthlyData: {}
  });

  useEffect(() => {
    if (!currentUser) return;

    // Filter user's data
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    const userAccounts = accounts.filter(a => a.userId === currentUser.id);

    // Calculate totals
    const totals = userTransactions.reduce((acc, trans) => {
      const amount = parseFloat(trans.amount) || 0;
      if (trans.transType === 'Income') {
        acc.totalIncome += amount;
      } else if (trans.transType === 'Expense' || trans.transType === 'Loan Payment') {
        acc.totalExpense += amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    // Get account balances
    const accountBalances = userAccounts.map(account => ({
      name: account.name,
      group: account.group,
      balance: account.amount
    }));

    // Calculate total balance
    const totalBalance = accountBalances.reduce((sum, acc) => sum + acc.balance, 0);

    // Get recent transactions (last 5)
    const recentTransactions = userTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Calculate expenses by category
    const expensesByCategory = userTransactions
      .filter(t => t.transType === 'Expense')
      .reduce((acc, trans) => {
        const tag = trans.tag || 'Other';
        acc[tag] = (acc[tag] || 0) + parseFloat(trans.amount);
        return acc;
      }, {});

    // Calculate monthly trends
    const monthlyData = userTransactions.reduce((acc, trans) => {
      const date = new Date(trans.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expense: 0 };
      }
      
      const amount = parseFloat(trans.amount);
      if (trans.transType === 'Income') {
        acc[monthYear].income += amount;
      } else if (trans.transType === 'Expense' || trans.transType === 'Loan Payment') {
        acc[monthYear].expense += amount;
      }
      
      return acc;
    }, {});

    setSummary({
      ...totals,
      totalBalance,
      accountBalances,
      recentTransactions,
      expensesByCategory,
      monthlyData
    });
  }, [transactions, accounts, currentUser]);

  const monthlyChartData = {
    labels: Object.keys(summary.monthlyData),
    datasets: [
      {
        label: 'Income',
        data: Object.values(summary.monthlyData).map(m => m.income),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Expense',
        data: Object.values(summary.monthlyData).map(m => m.expense),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const expenseChartData = {
    labels: Object.keys(summary.expensesByCategory),
    datasets: [{
      data: Object.values(summary.expensesByCategory),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
      ]
    }]
  };

  if (!currentUser) {
    return (
      <div className="text-center p-5">
        <h2>Please login to view your dashboard</h2>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Welcome, {currentUser.name || currentUser.email}!</h2>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Balance</Card.Title>
              <h3 className={`${summary.totalBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{summary.totalBalance.toLocaleString()}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <h3 className="text-success">₹{summary.totalIncome.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Expenses</Card.Title>
              <h3 className="text-danger">₹{summary.totalExpense.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Monthly Income vs Expenses</Card.Title>
              <Line 
                data={monthlyChartData}
                options={{
                  responsive: true,
                  plugins: {
                    datalabels: {
                      display: true,
                      color: '#fff',
                      formatter: (value) => `₹${value.toLocaleString()}`
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Expenses by Category</Card.Title>
              <Doughnut 
                data={expenseChartData}
                options={{
                  plugins: {
                    datalabels: {
                      color: '#fff',
                      formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                      }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Account Balances */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Account Balances</Card.Title>
          <Table responsive>
            <thead>
              <tr>
                <th>Account</th>
                <th>Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {summary.accountBalances.map((account, index) => (
                <tr key={index}>
                  <td>{account.name}</td>
                  <td>{account.group}</td>
                  <td className={account.balance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{account.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <Card.Body>
          <Card.Title>Recent Transactions</Card.Title>
          <Table responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>From/To</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentTransactions.map((trans, index) => (
                <tr key={index}>
                  <td>{new Date(trans.date).toLocaleDateString()}</td>
                  <td>{trans.transType}</td>
                  <td>{trans.from} → {trans.to}</td>
                  <td className={trans.transType === 'Income' ? 'text-success' : 'text-danger'}>
                    ₹{trans.amount.toLocaleString()}
                  </td>
                  <td>{trans.note}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;