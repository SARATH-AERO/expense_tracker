import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Table, Button, Card, Row, Col, Badge, Modal } from 'react-bootstrap';
import { FaPlus, FaFilter, FaFileExcel } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import NewTransactionModal from '../popUp/NewTransactionModal';
import FilterModal from '../popUp/FilterModal';
import { AppContext } from '../context/AppContext';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Transactions = () => {
  const { currentUser } = useContext(AppContext);
  const { accounts, setAccounts, transactions, setTransactions, addTransaction, deleteTransaction } = useContext(AppContext);

  const [addPopShow, setAddPopShow] = useState(false);
  const [filterPopShow, setFilterPopShow] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    accounts: [],
    dateRange: { start: null, end: null },
    types: [],
    tags: [],
    amountRange: { min: null, max: null }
  });

  const [confirmModal, setConfirmModal] = useState({ show: false, tx: null });
  const [successModal, setSuccessModal] = useState(false);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredTransactions.length) return [];

    const grouped = {};
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString();
      if (!grouped[date]) grouped[date] = { date, income: 0, expense: 0, selfTransfer: 0 };
      const amount = parseFloat(tx.amount) || 0;

      if (tx.transType === 'Income') grouped[date].income += amount;
      else if (tx.transType === 'Expense' || tx.transType === 'Loan Payment') grouped[date].expense += amount;
      else if (tx.transType === 'Self-Transfer') grouped[date].selfTransfer += amount;
    });

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredTransactions]);

  // Handle Revert
const handleRevertTransaction = (tx) => {
  setConfirmModal({ show: true, tx });
};


const confirmRevert = () => {
  const tx = confirmModal.tx;
  if (!tx) return;

  const updatedAccounts = accounts.map(a => ({ ...a }));
  const amount = parseFloat(tx.amount) || 0;

  const fromAcc = updatedAccounts.find(a => a.name === tx.from);
  const toAcc = updatedAccounts.find(a => a.name === tx.to);

  const type = tx.transType?.toLowerCase().replace(/\s|-/g, "");

switch (type) {
  case "expense":
    if (fromAcc) fromAcc.amount += amount;
    break;

  case "income":
    if (toAcc) toAcc.amount -= amount;
    break;

  case "transfer":
  case "selftransfer":
  case "transferout":
  case "transferin":
    if (fromAcc) fromAcc.amount += amount;
    if (toAcc) toAcc.amount -= amount;
    break;

  case "loanpayment":
    if (fromAcc) fromAcc.amount += amount; // refund payer
    if (toAcc) toAcc.amount += amount;     // increase owed again
    break;

  case "loandisbursement":
    if (fromAcc) fromAcc.amount -= amount; // lower loan balance
    if (toAcc) toAcc.amount -= amount;     // remove credited money
    break;

  default:
    console.warn("Unknown type:", tx.transType, "normalized:", type);
    return;
}


  // Update state
  setAccounts(updatedAccounts);

  // Log reversal transaction
  const reversal = {
    id: Date.now(),
    date: new Date().toISOString(),
    amount: tx.amount,
    tag: tx.tag,
    note: `Reverted ${tx.transType}`,
    userId: tx.userId,
    transType: `Reversal of ${tx.transType}`,
    from: tx.to,
    to: tx.from,
  };

  addTransaction(reversal);
  setConfirmModal({ show: false, tx: null });
  setSuccessModal(true);

  console.log("✅ Reversal added:", reversal);
  console.log("✅ Updated account balances:", updatedAccounts);
};


  useEffect(() => {
    let filtered = [...transactions.filter(tx => tx.userId === currentUser?.id)];

    if (filters.accounts.length > 0) {
      filtered = filtered.filter(trans =>
        filters.accounts.includes(trans.from) || filters.accounts.includes(trans.to)
      );
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(trans => filters.types.includes(trans.transType));
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(trans => {
        const txDate = new Date(trans.date);
        return txDate >= filters.dateRange.start && txDate <= filters.dateRange.end;
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

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(trans => filters.tags.includes(trans.tag));
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredTransactions(filtered);
  }, [transactions, currentUser, filters]);

  const summary = useMemo(() => {
    const stats = filteredTransactions.reduce((acc, trans) => {
      const amount = parseFloat(trans.amount);
      if (trans.transType === 'Income') acc.totalIncome += amount;
      else if (trans.transType === 'Expense' || trans.transType === 'Loan Payment') acc.totalExpense += amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    return {
      ...stats,
      netFlow: stats.totalIncome - stats.totalExpense,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

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
    XLSX.writeFile(wb, `transactions.xlsx`);
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
          <Card className="h-100"><Card.Body><Card.Title>Net Flow</Card.Title>
            <h3 className={summary.netFlow >= 0 ? 'text-success' : 'text-danger'}>₹{summary.netFlow.toLocaleString()}</h3>
          </Card.Body></Card>
        </Col>
        <Col md={3}>
          <Card className="h-100"><Card.Body><Card.Title>Total Income</Card.Title>
            <h3 className="text-success">₹{summary.totalIncome.toLocaleString()}</h3>
          </Card.Body></Card>
        </Col>
        <Col md={3}>
          <Card className="h-100"><Card.Body><Card.Title>Total Expense</Card.Title>
            <h3 className="text-danger">₹{summary.totalExpense.toLocaleString()}</h3>
          </Card.Body></Card>
        </Col>
        <Col md={3}>
          <Card className="h-100"><Card.Body><Card.Title>Transactions</Card.Title>
            <h3>{summary.transactionCount}</h3>
          </Card.Body></Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleAddTransaction} className="d-flex align-items-center gap-2">
            <FaPlus /> New Transaction
          </Button>
          <Button variant="secondary" onClick={() => setFilterPopShow(true)} className="d-flex align-items-center gap-2">
            <FaFilter /> Filter
          </Button>
        </div>
        <Button variant="success" onClick={exportToExcel} className="d-flex align-items-center gap-2">
          <FaFileExcel /> Export to Excel
        </Button>
      </div>

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
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((trans) => {
            // Determine badge color safely
            let badgeColor = "secondary";
            if (trans.transType.includes("Income")) badgeColor = "success";
            else if (trans.transType.includes("Expense")) badgeColor = "danger";
            else if (trans.transType.includes("Transfer")) badgeColor = "info";
            else if (trans.transType.includes("Loan")) badgeColor = "warning";
            else if (trans.transType.startsWith("Reversal")) badgeColor = "dark";

            return (
              <tr
                key={trans.id}
                style={{
                  opacity: trans.transType.startsWith("Reversal") ? 0.6 : 1,
                  filter: trans.transType.startsWith("Reversal") ? "blur(0.4px)" : "none",
                  backgroundColor: trans.transType.startsWith("Reversal") ? "#f8f9fa" : "transparent",
                }}
              >
                <td>{new Date(trans.date).toLocaleDateString()}</td>
                <td>
                  <Badge bg={badgeColor}>{trans.transType}</Badge>
                </td>
                <td>{trans.from || "-"}</td>
                <td>{trans.to || "-"}</td>
                <td className="text-end">
                  <span
                    className={
                      trans.transType.includes("Income")
                        ? "text-success"
                        : trans.transType.includes("Expense")
                        ? "text-danger"
                        : trans.transType.includes("Transfer")
                        ? "text-info"
                        : "text-dark"
                    }
                  >
                    ₹{parseFloat(trans.amount || 0).toLocaleString()}
                  </span>
                </td>
                <td>{trans.tag || "-"}</td>
                <td>{trans.note || "-"}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    disabled={trans.transType.startsWith("Reversal")}
                    onClick={() => handleRevertTransaction(trans)}
                  >
                    Revert
                  </Button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="8" className="text-center text-muted py-4">
              No transactions found
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </Card.Body>
</Card>


      <NewTransactionModal show={addPopShow} onClose={handleClose} />
      <FilterModal show={filterPopShow} handleClose={handleClose} applyFilters={handleFilterApply} initialFilters={filters} accounts={accounts} />

      {/* Confirm Revert Modal */}
      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, tx: null })} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Revert</Modal.Title></Modal.Header>
        <Modal.Body>
          {confirmModal.tx && (
            <>
              <p>Are you sure you want to revert this transaction?</p>
              <ul>
                <li><strong>Type:</strong> {confirmModal.tx.transType}</li>
                <li><strong>Amount:</strong> ₹{confirmModal.tx.amount}</li>
                <li><strong>Tag:</strong> {confirmModal.tx.tag}</li>
                <li><strong>From:</strong> {confirmModal.tx.from || '—'}</li>
                <li><strong>To:</strong> {confirmModal.tx.to || '—'}</li>
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmModal({ show: false, tx: null })}>Cancel</Button>
          <Button variant="danger" onClick={confirmRevert}>Confirm</Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={successModal} onHide={() => setSuccessModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Transaction Reverted</Modal.Title></Modal.Header>
        <Modal.Body>The transaction has been successfully reverted.</Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setSuccessModal(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Transactions;
