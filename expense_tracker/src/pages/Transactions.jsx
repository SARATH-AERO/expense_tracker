import React, { useState, useContext, useEffect } from 'react';
import { Button, Table, Dropdown, Modal } from 'react-bootstrap';
import { FaPlus, FaCalendarAlt, FaFilter, FaTrash } from 'react-icons/fa';
import { AppContext, AppProvider } from '../context/AppContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FilterModal from '../popUp/FilterModal';
import NewTransactionModal from '../popUp/NewTransactionModal';


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
  // const [filteredTransactions, setfilteredTransactions] = useState([]);

  useEffect(() => {
    const currentDate = getCurrentDate();
    setSelectedDate(currentDate);
  }, []);

  useEffect(() => {
    console.log(accounts);
  }, [accounts])

  const handleShow = ({ message }) => {
    if (message === 'new expense') {
      setAddPopShow(true);
    }
  }

  const getCurrentDate = () => {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString(undefined, options);
  };

  function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return yesterday.toLocaleDateString(undefined, options);
  }
  function getLast7Days() {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 6);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return `${last7Days.toLocaleDateString(undefined, options)} - ${today.toLocaleDateString(undefined, options)}`;
  }

  function getLast30Days() {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 29);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return `${last30Days.toLocaleDateString(undefined, options)} - ${today.toLocaleDateString(undefined, options)}`;
  }

  function getThisMonth() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return `${startOfMonth.toLocaleDateString(undefined, options)} - ${today.toLocaleDateString(undefined, options)}`;
  }

  const handleDateChange = (range) => {
    switch (range) {
      case 'Today':
        setSelectedDate(getCurrentDate());
        setStartDate(new Date());
        setEndDate(new Date());
        break;
      case 'Yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setSelectedDate(getYesterdayDate());
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case 'Last 7 Days':
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 6);
        setSelectedDate(getLast7Days());
        setStartDate(last7Days);
        setEndDate(new Date());
        break;
      case 'Last 30 Days':
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 29);
        setSelectedDate(getLast30Days());
        setStartDate(last30Days);
        setEndDate(new Date());
        break;
      case 'This Month':
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setSelectedDate(getThisMonth());
        setStartDate(startOfMonth);
        setEndDate(today);
        break;
      case 'Custom Date':
        setShowDatePicker(true);
        break;
      default:
        setSelectedDate(getCurrentDate());
        setStartDate(new Date());
        setEndDate(new Date());
    }
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

//   useEffect(() => {
//     const filteredTransactions1 = transactions.filter(transaction => {
//         const transactionDate = new Date(transaction.date);
//         if (!startDate || !endDate) return true;
//         const inclusiveEndDate = new Date(endDate);
//         inclusiveEndDate.setHours(23, 59, 59, 999);

//         const matchesDateRange = transactionDate >= startDate && transactionDate <= inclusiveEndDate;
//         const matchesAccount = selectedAccounts.length === 0 || selectedAccounts.includes(transaction.from) || selectedAccounts.includes(transaction.to);
//         const matchesCategory = selectedTags.length === 0 || selectedTags.includes(transaction.tag);

//         console.log('Transaction:', transaction);
//         console.log('Matches Date Range:', matchesDateRange);
//         console.log('Matches Account:', matchesAccount);
//         console.log('Matches Category:', matchesCategory);

//         return matchesDateRange && matchesAccount && matchesCategory;
//       });
//     setfilteredTransactions( filteredTransactions1);
// console.log('useeffect');

//   }, [selectedAccounts, selectedTags, startDate, endDate, transactions]);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    if (!startDate || !endDate) return true;
    const inclusiveEndDate = new Date(endDate);
    inclusiveEndDate.setHours(23, 59, 59, 999);
  
    const matchesDateRange = transactionDate >= startDate && transactionDate <= inclusiveEndDate;
    const matchesAccount = selectedAccounts.length === 0 || selectedAccounts.includes(transaction.from) || selectedAccounts.includes(transaction.to);
    const matchesCategory = selectedTags.length === 0 || selectedTags.includes(transaction.tag);
  
    console.log('Transaction:', transaction);
    console.log('Matches Date Range:', matchesDateRange);
    console.log('Matches Account:', matchesAccount);
    console.log('Matches Category:', matchesCategory);

    return matchesDateRange && matchesAccount && matchesCategory;
  });

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

  const styles = {
    noCaret: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '10px',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '10px',
    },
    calendarIcon: {
      marginRight: '8px',
    },
  };



  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', margin: 0, padding: 0 }}>
      <div style={{ width: '100%', margin: 0, padding: 0 }}>
        <Table striped bordered hover style={{ margin: 0 }}>
          <tbody>
            <tr>
              <td colSpan="6" style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Button variant="primary" onClick={() => handleShow({ message: 'new expense' })} style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                    <FaPlus style={{ marginRight: '8px' }} /> NEW TRANSACTION
                  </Button>
                  <Dropdown>
                    <Dropdown.Toggle as={Button} variant="secondary">
                      <FaCalendarAlt /> {selectedDate}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleDateChange('Today')}>Today</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateChange('Yesterday')}>Yesterday</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateChange('Last 7 Days')}>Last 7 Days</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateChange('Last 30 Days')}>Last 30 Days</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateChange('This Month')}>This Month</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateChange('Custom Date')}>Custom Date</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button variant="secondary" onClick={handleFilterShow} style={{ display: 'flex', alignItems: 'center' }}>
                    <FaFilter style={{ marginRight: '8px' }} /> Filter
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


