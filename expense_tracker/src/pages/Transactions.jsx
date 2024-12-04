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
  const { accounts, setAccounts ,transactions, setTransactions } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});

  useEffect(() => {
    const currentDate = getCurrentDate();
    setSelectedDate(currentDate);
  }, []);

  useEffect( () => {
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
        break;
      case 'Yesterday':
        setSelectedDate(getYesterdayDate());
        break;
      case 'Last 7 Days':
        setSelectedDate(getLast7Days());
        break;
      case 'Last 30 Days':
        setSelectedDate(getLast30Days());
        break;
      case 'This Month':
        setSelectedDate(getThisMonth());
        break;
      case 'Custom Date':
        setShowDatePicker(true);
        break;
      default:
        setSelectedDate(getCurrentDate());
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
                    <Dropdown.Toggle
                      as={Button}
                      variant="secondary"
                      style={styles.noCaret}
                    >
                      <FaCalendarAlt style={styles.calendarIcon} /> {selectedDate}
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
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.from}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.tag}</td>
                <td>{formatDate(transaction.date)}</td>
                <td>{transaction.note}</td>
                <td>{transaction.transType}</td>
                <td style={{ textAlign: 'center' }}>
                  <Button variant="danger" onClick={() => handleDelete(index)} style={{ display: 'flex', alignItems: 'center' }}>
                    <FaTrash style={{ cursor: 'pointer', marginRight: '8px' }} /> DELETE
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>


        {showDatePicker == true && (
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
        <FilterModal show={showFilterModal} handleClose={handleClose} />

    { showModal &&     <Modal show={showModal} onHide={handleClose}>
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
}
      </div>
    </div>
  );
};

export default Transactions;


