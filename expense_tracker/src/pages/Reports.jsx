import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Table, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { FaPlus, FaFilter, FaFileExcel } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import NewTransactionModal from '../popUp/NewTransactionModal';
import FilterModal from '../popUp/FilterModal';
import { AppContext } from '../context/AppContext';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


const Reports = () => {
  const { transactions, accounts, currentUser } = useContext(AppContext);
  const [addPopShow, setAddPopShow] = useState(false);
  const [filterPopShow, setFilterPopShow] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    accounts: [],
    dateRange: { start: null, end: null },
    types: [],
    tags: [],
    amountRange: { min: null, max: null }
  });

  
  // Prepare chart data: Income vs Expense (and Self-Transfer / Loan Payment)
const chartData = useMemo(() => {
  if (!filteredTransactions.length) return [];

  // Group transactions by date
  const grouped = {};
  filteredTransactions.forEach(tx => {
    const date = new Date(tx.date).toLocaleDateString();
    if (!grouped[date]) grouped[date] = { date, income: 0, expense: 0, selfTransfer: 0 };

    const amount = parseFloat(tx.amount) || 0;

    if (tx.transType === 'Income') {
      grouped[date].income += amount;
    } else if (tx.transType === 'Expense' || tx.transType === 'Loan Payment') {
      grouped[date].expense += amount;
    } else if (tx.transType === 'Self-Transfer') {
      grouped[date].selfTransfer += amount;
    }
  });

  // Convert grouped object → sorted array by date
  return Object.values(grouped).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}, [filteredTransactions]);


  // Filter transactions for current user
  const userTransactions = useMemo(() => 
    transactions.filter(tx => tx.userId === currentUser?.id)
  , [transactions, currentUser]);

  const userAccounts = useMemo(() => 
    accounts.filter(acc => acc.userId === currentUser?.id)
  , [accounts, currentUser]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const stats = filteredTransactions.reduce((acc, trans) => {
      const amount = parseFloat(trans.amount);
      if (trans.transType === 'Income') {
        acc.totalIncome += amount;
      } else if (trans.transType === 'Expense' || trans.transType === 'Loan Payment') {
        acc.totalExpense += amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    return {
      ...stats,
      netFlow: stats.totalIncome - stats.totalExpense,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Apply filters to transactions
  useEffect(() => {
    let filtered = [...userTransactions];

    if (filters.accounts.length > 0) {
      filtered = filtered.filter(trans => 
        filters.accounts.includes(trans.from) || 
        filters.accounts.includes(trans.to)
      );
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(trans => 
        filters.types.includes(trans.transType)
      );
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(trans => {
        const txDate = new Date(trans.date);
        return txDate >= filters.dateRange.start && 
               txDate <= filters.dateRange.end;
      });
    }

    if (filters.amountRange.min !== null) {
      filtered = filtered.filter(trans => 
        parseFloat(trans.amount) >= filters.amountRange.min
      );
    }

    if (filters.amountRange.max !== null) {
      filtered = filtered.filter(trans => 
        parseFloat(trans.amount) <= filters.amountRange.max
      );
    }

    // Filter by tags/categories
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(trans => filters.tags.includes(trans.tag));
    }

    // Sort by date, most recent first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
  }, [userTransactions, filters]);

  const handleAddTransaction = () => setAddPopShow(true);
  const handleClose = () => {
    setAddPopShow(false);
    setFilterPopShow(false);
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setFilterPopShow(false);
  };

  const exportToExcel = () => {
    const data = filteredTransactions.map(trans => ({
      Date: new Date(trans.date).toLocaleDateString(),
      Type: trans.transType,
      From: trans.from,
      To: trans.to,
      Amount: trans.amount,
      Tag: trans.tag,
      Note: trans.note
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    
    // Generate filename with date range
    const dateStr = filters.dateRange.start && filters.dateRange.end
      ? `_${filters.dateRange.start.toLocaleDateString()}_to_${filters.dateRange.end.toLocaleDateString()}`
      : '';
    
    XLSX.writeFile(wb, `transactions${dateStr}.xlsx`);
  };

  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Card className="text-center p-4">
          <Card.Body>
            <Card.Title>Please Login</Card.Title>
            <Card.Text>You need to be logged in to view transactions.</Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }


  return (
    <div className="container-fluid p-4">
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Net Flow</Card.Title>
              <h3 className={summary.netFlow >= 0 ? 'text-success' : 'text-danger'}>
                ₹{summary.netFlow.toLocaleString()}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <h3 className="text-success">₹{summary.totalIncome.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Expense</Card.Title>
              <h3 className="text-danger">₹{summary.totalExpense.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Transactions</Card.Title>
              <h3>{summary.transactionCount}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          {/* <Button 
            variant="primary" 
            onClick={handleAddTransaction}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus /> New Transaction
          </Button> */}
          <Button 
            variant="secondary" 
            onClick={() => setFilterPopShow(true)}
            className="d-flex align-items-center gap-2"
          >
            <FaFilter /> Filter
          </Button>
        </div>
        <Button 
          variant="success" 
          onClick={exportToExcel}
          className="d-flex align-items-center gap-2"
        >
          <FaFileExcel /> Export to Excel
        </Button>
      </div>

      {/* // Active Filters Display */}
      {/* Active Filters Display */}
{(
  filters.accounts.length > 0 ||
  filters.types.length > 0 ||
  filters.tags?.length > 0 ||
  filters.dateRange.start ||
  filters.amountRange?.min ||
  filters.amountRange?.max
) && (
  <div className="mb-3">
    <h6>Active Filters:</h6>
    <div className="d-flex flex-wrap gap-2">
      {filters.accounts.map(acc => (
        <Badge bg="info" key={`acc-${acc}`}>{acc}</Badge>
      ))}

      {filters.types.map(type => (
        <Badge bg="primary" key={`type-${type}`}>{type}</Badge>
      ))}

      {filters.tags?.map(tag => (
        <Badge bg="warning" key={`tag-${tag}`}>{tag}</Badge>
      ))}

      {filters.dateRange.start && filters.dateRange.end && (
        <Badge bg="secondary" key="date-range">
          {filters.dateRange.start.toLocaleDateString()} – {filters.dateRange.end.toLocaleDateString()}
        </Badge>
      )}

      {(filters.amountRange?.min || filters.amountRange?.max) && (
        <Badge bg="dark" key="amount-range">
          Amount:&nbsp;
          {filters.amountRange.min ? filters.amountRange.min : '0'}
          &nbsp;–&nbsp;
          {filters.amountRange.max ? filters.amountRange.max : '∞'}
        </Badge>
      )}
    </div>
  </div>
)}


      {/* Transactions Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th className="text-end">Amount</th>
                <th>Tag</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((trans) => (
                <tr key={trans.id}>
                  <td>{new Date(trans.date).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={
                      trans.transType === 'Income' ? 'success' :
                      trans.transType === 'Expense' ? 'danger' :
                      trans.transType === 'Transfer' ? 'info' : 
                      'warning'
                    }>
                      {trans.transType}
                    </Badge>
                  </td>
                  <td>{trans.from}</td>
                  <td>{trans.to}</td>
                  <td className="text-end">
                    <span className={
                      trans.transType === 'Income' ? 'text-success' :
                      trans.transType === 'Expense' ? 'text-danger' :
                      'text-info'
                    }>
                      ₹{parseFloat(trans.amount).toLocaleString()}
                    </span>
                  </td>
                  <td>{trans.tag}</td>
                  <td>{trans.note}</td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <NewTransactionModal 
        show={addPopShow} 
        onClose={handleClose}
      />
      
      <FilterModal
        show={filterPopShow}
        handleClose={handleClose}
        applyFilters={handleFilterApply}
        initialFilters={filters}
        accounts={userAccounts}
      />

      {/* Income vs Expenses Chart */}
<Card className="mb-4">
  <Card.Body>
    <Card.Title>Income vs Expenses Over Time</Card.Title>
    {chartData.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#28a745" name="Income" strokeWidth={2} />
          <Line type="monotone" dataKey="expense" stroke="#dc3545" name="Expense" strokeWidth={2} />
          <Line type="monotone" dataKey="selfTransfer" stroke="#17a2b8" name="Self-Transfer" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-muted text-center mb-0">No data available for selected filters.</p>
    )}
  </Card.Body>
</Card>

    </div>
  );
};

export default Reports;