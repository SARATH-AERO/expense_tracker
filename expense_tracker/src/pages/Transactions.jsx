import React, { useState, useContext, useEffect } from 'react';
import { Button, Table, Dropdown, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaCalendarAlt, FaFilter, FaTrash, FaFileExcel } from 'react-icons/fa';
import { AppContext, AppProvider } from '../context/AppContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FilterModal from '../popUp/FilterModal';
import NewTransactionModal from '../popUp/NewTransactionModal';
import * as XLSX from 'xlsx';


const Transactions = () => {

  const [addPopShow, setAddPopShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { accounts, setAccounts, transactions, setTransactions } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalSelfTransfer, setTotalSelfTransfer] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  // const [filteredTransactions, setfilteredTransactions] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [transactionType, setTransactionType] = useState('All Types');

  const handleMouseEnter = (item) => {
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const dropdownItems = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Custom Date',
  ];

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    setSelectedDate(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    setStartDate(start);
    setEndDate(end);
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, startDate, endDate, selectedAccounts, selectedTags, transactionType]);

  useEffect(() => {
    calculateTotals();
  }, [filteredTransactions]);

  useEffect(() => {
    console.log(accounts);
  }, [accounts])

  const handleShow = ({ message }) => {
    if (message === 'new expense') {
      setAddPopShow(true);
    }
  }

  const resetFilters = () => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    setSelectedDate(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    setStartDate(start);
    setEndDate(end);
    setSelectedAccounts([]);
    setSelectedTags([]);
    setTransactionType('All Types');
  };

  const handleDateChange = (range) => {
    const today = new Date();
    let start, end;

    switch (range) {
      case 'Today':
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'Yesterday':
        start = new Date(today.setDate(today.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'Last 7 Days':
        start = new Date(today.setDate(today.getDate() - 6));
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'Last 30 Days':
        start = new Date(today.setDate(today.getDate() - 29));
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'This Month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'Custom Date':
        setShowDatePicker(true);
        return;
      default:
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
    }

    setSelectedDate(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    setStartDate(start);
    setEndDate(end);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      setSelectedDate(`${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`);
      setShowDatePicker(false);
    }
  };

  const handleFilterShow = () => setShowFilterModal(true);
  const handleClose = () => {
    setShowFilterModal(false);
    setAddPopShow(false);
    setShowModal(false);
  }

  function formatDate(dateObject) {
    if (!(dateObject instanceof Date)) {
      return dateObject; // Return an empty string or a default value if dateObject is not a Date instance
    }
    // Convert the date object to a string
    const dateString = dateObject.toString();
    // Split the date string to remove the timezone part
    const dateParts = dateString.split(' GMT')[0];
    return dateParts;
  }

  const handleDelete = (index) => {
    const transaction = transactions[index];
    let updatedAccounts = [...accounts];
    const transactionAmount = parseFloat(transaction.amount); // Convert to number

    if (transaction.transType === 'Expense') {
      updatedAccounts = updatedAccounts.map(account => {
        if (account.name === transaction.from) {
          return { ...account, amount: account.amount + transactionAmount };
        }
        return account;
      });
    } else if (transaction.transType === 'Self-Transfer') {
      updatedAccounts = updatedAccounts.map(account => {
        if (account.name === transaction.from) {
          return { ...account, amount: account.amount + transactionAmount };
        } else if (account.name === transaction.tag) {
          return { ...account, amount: account.amount - transactionAmount };
        }
        return account;
      });
    } else if (transaction.transType === 'Income') {
      updatedAccounts = updatedAccounts.map(account => {
        if (account.name === transaction.tag) {
          return { ...account, amount: account.amount - transactionAmount };
        }
        return account;
      });
    } else if (transaction.transType === 'Loan Payment') {
      updatedAccounts = updatedAccounts.map(account => {
        if (account.name === transaction.from) {
          return { ...account, amount: account.amount + transactionAmount };
        } else if (account.name === transaction.tag) {
          return { ...account, amount: account.amount + transactionAmount };
        }
        return account;
      });
    }

    setAccounts(updatedAccounts);
    setTransactions(transactions.filter((_, i) => i !== index));

    setModalContent({
      from: transaction.from,
      amount: transaction.amount,
      to: transaction.tag,
      date: transaction.date,
      note: transaction.note,
      type: transaction.transType,
      message: 'Transaction revert successful'
    });
    setShowModal(true);
  };

  const applyFilters = (accounts, selectedTags) => {

    setSelectedAccounts(accounts);
    setSelectedTags(selectedTags);
    // console.log(selectedAccounts);
    // console.log(selectedTags);
  };

  const filterTransactions = () => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (!startDate || !endDate) return true;

      const inclusiveEndDate = new Date(endDate);
      inclusiveEndDate.setHours(23, 59, 59, 999);

      const matchesDateRange = transactionDate >= startDate && transactionDate <= inclusiveEndDate;
      const matchesAccount = selectedAccounts.length === 0 || selectedAccounts.includes(transaction.from) || selectedAccounts.includes(transaction.to);
      const matchesCategory = selectedTags.length === 0 || selectedTags.includes(transaction.tag);
      const matchesType = transactionType === 'All Types' || transaction.transType === transactionType;

      return matchesDateRange && matchesAccount && matchesCategory && matchesType;
    });

    setFilteredTransactions(filtered);
  };

  const handleGenerateReport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTransactions.map(transaction => ({
      From: transaction.from,
      Amount: transaction.amount,
      To: transaction.tag,
      'Transaction Date': transaction.date.toLocaleDateString(),
      'Transaction Type': transaction.transType,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, 'Transactions_Report.xlsx');
  };

  const calculateTotals = () => {
    const income = filteredTransactions
      .filter(transaction => transaction.transType === 'Income')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    const selfTransfer = filteredTransactions
      .filter(transaction => transaction.transType === 'Self-Transfer')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    const expense = filteredTransactions
      .filter(transaction => transaction.transType === 'Expense' || transaction.transType === 'Loan Payment')
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    setTotalIncome(income);
    setTotalSelfTransfer(selfTransfer);
    setTotalExpense(expense);
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

  // const styles = {
  //   noCaret: {
  //     display: 'flex',
  //     alignItems: 'center',
  //     marginRight: '10px',
  //   },
  //   button: {
  //     display: 'flex',
  //     alignItems: 'center',
  //     marginRight: '10px',
  //   },
  //   calendarIcon: {
  //     marginRight: '8px',
  //   },
  // };

  const styles = {
    dropdownToggle: {
      backgroundColor: '#4CAF50',
      color: 'white',
    },
    dropdownItem: (isHovered) => ({
      backgroundColor: isHovered ? '#4CAF50' : 'white',
      color: isHovered ? 'white' : 'black',
    }),
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#e67300',
    },
    excelButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'green',
      color: 'white',
      marginRight: '8px',
    },
  };



  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', margin: 0, padding: 0 }}>
      <div style={{ width: '100%', margin: 0, padding: 0 }}>
        <Table striped bordered hover style={{ margin: 0 }}>
          <tbody>
            <tr>
              <td colSpan="7" style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Button variant="primary" onClick={() => handleShow({ message: 'new expense' })} style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                    <FaPlus style={{ marginRight: '8px' }} /> NEW TRANSACTION
                  </Button>
                  <Dropdown>
                    <Dropdown.Toggle as={Button} variant="secondary" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                      <FaCalendarAlt /> {selectedDate}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {dropdownItems.map((item) => (
                        <Dropdown.Item
                          key={item}
                          onClick={() => handleDateChange(item)}
                          onMouseEnter={() => handleMouseEnter(item)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            backgroundColor: hoveredItem === item ? '#4CAF50' : 'white', // Highlight on hover
                            color: hoveredItem === item ? 'white' : 'black', // Change text color on hover
                          }}
                        >
                          {item}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button variant="secondary" onClick={handleFilterShow} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e67300' }}>
                    <FaFilter style={{ marginRight: '8px' }} /> Filter
                  </Button>
                  <Form.Control as="select" value={transactionType} onChange={(e) => setTransactionType(e.target.value)} style={{ width: '130px', marginLeft: '10px', backgroundColor: '#b33c00', color: 'white' }}>
                    <option>All Types</option>
                    <option>Expense</option>
                    <option>Self-Transfer</option>
                    <option>Income</option>
                    <option>Loan Payment</option>
                  </Form.Control>
                  <Button variant="secondary" onClick={handleGenerateReport} style={styles.excelButton}>
                    <FaFileExcel style={{ marginRight: '8px' }} /> Generate Excel
                  </Button>
                  <Button variant="secondary" onClick={resetFilters} style={{ display: 'flex', alignItems: 'center' }}>
                    RESET
                  </Button>
                </div>
              </td>
            </tr>
            <tr>
              <th>From</th>
              <th>Amount</th>
              <th>To</th>
              <th>Date</th>
              <th>Note</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
            {filteredTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.from}</td>
                <td style={getAmountStyle(transaction.transType)}>
                  {getAmountPrefix(transaction.transType)}{transaction.amount}
                </td>
                <td>{transaction.tag}</td>
                <td>{formatDate(transaction.date)}</td>
                <td>{transaction.note}</td>
                <td>{transaction.transType}</td>
                <td style={{ textAlign: 'center' }}>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(index)}
                    style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', fontSize: '12px' }}
                  >
                    <FaTrash style={{ cursor: 'pointer', marginRight: '8px' }} /> DELETE
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Income:</td>
              <td style={{ color: 'green', fontWeight: '500', fontSize: '20px', textAlign: 'right', fontFamily: 'Roboto Mono, monospace' }}>+{totalIncome}</td>
            </tr>
            <tr>
              <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Self-Transfer:</td>
              <td style={{ color: 'blue', fontWeight: '500', fontSize: '20px', textAlign: 'right', fontFamily: 'Roboto Mono, monospace' }}>{totalSelfTransfer}</td>
            </tr>
            <tr>
              <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Expense:</td>
              <td style={{ color: 'red', fontWeight: '500', fontSize: '20px', textAlign: 'right', fontFamily: 'Roboto Mono, monospace' }}>-{totalExpense}</td>
            </tr>
          </tbody>
        </Table>

        {showDatePicker && (
          <Modal show={showDatePicker} onHide={() => setShowDatePicker(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Select Date Range</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <DatePicker
                selected={startDate}
                onChange={handleDateRangeChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDatePicker(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {addPopShow && <NewTransactionModal show={addPopShow} onClose={handleClose} />}
        <FilterModal show={showFilterModal} applyFilters={applyFilters} handleClose={handleClose} />

        {showModal && (
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{modalContent.message}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>From: {modalContent.from}</p>
              <p>Amount: {modalContent.amount}</p>
              <p>To: {modalContent.to}</p>
              <p>Date: {formatDate(modalContent.date)}</p>
              <p>Note: {modalContent.note}</p>
              <p>Type: {modalContent.type}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Transactions;


