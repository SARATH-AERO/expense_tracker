import React from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';
import Transactions from '../pages/Transactions';
import { data } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { type } from '@testing-library/user-event/dist/type';

const NewTransactionExpense = () => {
  const { transactions, addTransaction, accounts, setAccounts, currentUser } = useContext(AppContext);
  
  // Filter accounts by current user
  const userAccounts = accounts.filter(acc => acc.userId === currentUser?.id) || [];
  
  const [formData, setFormData] = useState({
    from: userAccounts.length > 0 ? userAccounts[0].name : '',
    amount: '',
    tag: 'Groceries',
    date: new Date(),
    note: '',
    userId: currentUser?.id // Add userId to transaction
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState(0);

  // Filter loan accounts out for expense transactions
  const toAccounts = userAccounts.filter(account => account.group !== 'Loan');


  // Update form when accounts change or user changes
  useEffect(() => {
    if (userAccounts.length > 0 && formData.from === '') {
      setFormData(prevState => ({
        ...prevState,
        from: userAccounts[0].name,
        userId: currentUser?.id
      }));
    }
  }, [userAccounts, currentUser]);

  // Update balance when account changes
  useEffect(() => {
    const selectedAccount = userAccounts.find(acc => acc.name === formData.from);
    if (selectedAccount) {
      setBalance(selectedAccount.amount);
    }
  }, [formData.from, userAccounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    
    const account = userAccounts.find(acc => acc.name === formData.from);
    if (!account) {
      setError('Account not found');
      return;
    }

    const amount = parseFloat(formData.amount);

    // Validate amount based on account type
    if (account.group === 'Cash' || account.group === 'Bank Account') {
      if (amount > account.amount) {
        setError('Not enough balance');
        return;
      }
      account.amount -= amount;
    } else if (account.group === 'Credit') {
      account.amount += amount;
    }

    // Update accounts
    setAccounts(accounts.map(acc => 
      acc.id === account.id ? account : acc
    ));

    // Add transaction with user context
    addTransaction({
      ...formData,
      amount: amount,
      userId: currentUser?.id,
      accountId: account.id,
      transType: 'Expense',
      createdAt: new Date().toISOString()
    });

    setError('');
    setSuccess('Expense recorded successfully');

    // Optional: Reset form after success
    setFormData(prev => ({
      ...prev,
      amount: '',
      note: ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prevData => ({
      ...prevData,
      date: date
    }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formFrom">
        <Form.Label>From Account</Form.Label>
        <select
          className="form-control form-select"
          name="from"
          value={formData.from}
          onChange={handleInputChange}
        >
          {toAccounts.map((account) => (
            <option key={account.name} value={account.name}>{account.name}</option>
          ))}
        </select>
      </Form.Group>
      {/* Balance Amount - read-only */}
      <Form.Group controlId="formBalance">
        <Form.Label>Available Balance</Form.Label>
        <Form.Control
          type="text"
          value={balance}
          readOnly
          style={{
            backgroundColor: '#f8f9fa',
            fontWeight: 'bold',
            color: balance < 0 ? 'red' : 'green',
            marginBottom: '10px'
          }}
        />
      </Form.Group>
      <Form.Group controlId="formAmount">
        <Form.Label>Transaction Amount</Form.Label>
        <Form.Control
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          isInvalid={!!error}
          required
        />
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="formTag">
        <Form.Label>Category</Form.Label>
        <select
          className="form-control form-select"
          name="tag"
          value={formData.tag}
          onChange={handleInputChange}
        >
          <option value="Groceries">Groceries</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Rent">Rent</option>
          <option value="Income Tax">Income Tax</option>
          <option value="Shopping">Shopping</option>
          <option value="Clothes">Clothes</option>
          <option value="Vacation">Vacation</option>
          <option value="Salary">Salary</option>
          <option value="Bonus">Bonus</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Hospital">Hospital</option>
          <option value="Others">Others</option>
        </select>
      </Form.Group>
      <Form.Group controlId="formDate">
        <Form.Label style={{marginTop:'20px', marginRight:'10px'}}>Transaction Date</Form.Label>
        <DatePicker selected={formData.date} onChange={handleDateChange}  />
      </Form.Group>
      <Form.Group controlId="formNote">
        <Form.Label>Note</Form.Label>
        <Form.Control type="text" name="note" value={formData.note} onChange={handleInputChange} style={{marginBottom:'10px'}} />
      </Form.Group>
      <div className="d-flex justify-content-center mt-3">
      <Button variant="primary" type="submit" style={{marginTop:'2opx'}}>
        Add Expense
      </Button>
      </div>
      {success && <div className="text-success mt-3">{success}</div>}
    </Form>
  );
};

export default NewTransactionExpense;