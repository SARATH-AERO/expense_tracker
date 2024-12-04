import React, { useState, useContext } from 'react';
import { Modal, Button, Form, Nav } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';
import NewTransactionExpense from './NewTransactionExpense';
import NewTransactionTransfer from './NewTransactionTransfer';
import NewTransactionIncome from './NewTransactionIncome';
import NewTransactionLoanPayment from './NewTransactionLoanPayment';

const NewTransactionModal = ({ show, onClose }) => {
  const { accounts, addTransaction } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('expense');
  const [formData, setFormData] = useState({
    from: '',
    amount: '',
    tag: '',
    date: new Date(),
    note: '',
    accounts: accounts
  });

  if (!show) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleSubmit = () => {
    addTransaction(formData, activeTab);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>New Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
          <Nav.Item>
            <Nav.Link eventKey="expense">Expense</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="transfer">Transfer</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="income">Income</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="loanPayment">Loan Payment</Nav.Link>
          </Nav.Item>
        </Nav>
        {activeTab === 'expense' && (
          <NewTransactionExpense
            formData={formData}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleSubmit={handleSubmit}
          />
        )}
        {activeTab === 'transfer' && (
          <NewTransactionTransfer
            formData={formData}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleSubmit={handleSubmit}
          />
        )}
        {activeTab === 'income' && (
          <NewTransactionIncome
            formData={formData}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleSubmit={handleSubmit}
          />
        )}
        {activeTab === 'loanPayment' && (
          <NewTransactionLoanPayment
            formData={formData}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleSubmit={handleSubmit}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default NewTransactionModal;