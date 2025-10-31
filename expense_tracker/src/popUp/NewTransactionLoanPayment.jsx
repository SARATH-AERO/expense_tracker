import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';

const NewTransactionLoanPayment = ({ handleSubmit }) => {
  const { accounts, setAccounts, addTransaction, currentUser } = useContext(AppContext);
  
  // Filter accounts by current user
  const userAccounts = accounts.filter(acc => acc.userId === currentUser?.id) || [];
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
    tag: '',
    date: new Date(),
    note: '',
    userId: currentUser?.id
  });

  const [fromBalance, setFromBalance] = useState(0);
  const [toPending, setToPending] = useState(0);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'from') {
      const selectedFrom = userAccounts.find(acc => acc.name === value);
      setFromBalance(selectedFrom ? selectedFrom.amount : 0);
    }

    if (name === 'to') {
      const selectedTo = userAccounts.find(acc => acc.name === value);
      setToPending(selectedTo ? selectedTo.amount : 0);
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  // Initialize defaults with user's accounts
  useEffect(() => {
    if (userAccounts.length > 0) {
      const defaultFrom = userAccounts.find(acc => 
        acc.group === 'Cash' || acc.group === 'Bank Account'
      );
      const defaultTo = userAccounts.find(acc => 
        acc.group === 'Credit' || acc.group === 'Loan'
      );

      if (defaultFrom && !formData.from) {
        handleInputChange({ target: { name: 'from', value: defaultFrom.name } });
        setFromBalance(defaultFrom.amount);
      }
      if (defaultTo && !formData.to) {
        handleInputChange({ target: { name: 'to', value: defaultTo.name } });
        setToPending(defaultTo.amount);
      }
    }
  }, [userAccounts, currentUser]);

  // Form validation and submission
  const validateAndSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const fromAccount = userAccounts.find(acc => acc.name === formData.from);
    const toAccount = userAccounts.find(acc => acc.name === formData.to);
    const amount = parseFloat(formData.amount);

    if (!fromAccount || !toAccount) {
      setError('Invalid account selection');
      return;
    }

    if (formData.from !== 'Others' && amount > fromAccount.amount) {
      setError('Not enough balance in the From account');
      return;
    }

    if (amount > toAccount.amount) {
      setError('Payment exceeds pending loan amount');
      return;
    }

    // Update account balances
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === fromAccount.id && formData.from !== 'Others') {
        return { ...acc, amount: acc.amount - amount };
      }
      if (acc.id === toAccount.id) {
        return { ...acc, amount: acc.amount - amount };
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    setFromBalance(fromAccount.amount - (formData.from !== 'Others' ? amount : 0));
    setToPending(toAccount.amount - amount);

    // Add transaction with user context
    addTransaction({
      ...formData,
      amount: amount,
      userId: currentUser?.id,
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      tag: toAccount.name,
      transType: 'Loan Payment',
      createdAt: new Date().toISOString()
    });

    setSuccess('Loan payment successful');
    setFormData(prev => ({ ...prev, amount: '', note: '' }));
  };
  const fromAccounts = accounts.filter(acc => acc.group === 'Cash' || acc.group === 'Bank Account');
  const toAccounts = accounts.filter(acc => acc.group === 'Credit' || acc.group === 'Loan');

  const fromColor = fromBalance > 0 ? 'green' : fromBalance < 0 ? 'red' : 'gray';
  const toColor = toPending > 0 ? 'red' : 'gray';

  return (
    <Form onSubmit={validateAndSubmit}>
      {/* 🔹 From Account */}
      <Form.Group controlId="formFrom">
        <Form.Label>From Account</Form.Label>
        <select
          className="form-control form-select"
          name="from"
          value={formData.from}
          onChange={handleInputChange}
        >
          {fromAccounts.map((acc) => (
            <option key={acc.name} value={acc.name}>{acc.name}</option>
          ))}
          <option value="Others">Others</option>
        </select>

        {/* Available balance */}
        <Form.Group controlId="formFromBalance" className="mt-2">
          <Form.Label>Available Balance</Form.Label>
          <Form.Control
            type="text"
            value={fromBalance.toLocaleString()}
            readOnly
            style={{
              backgroundColor: '#f8f9fa',
              color: fromColor,
              fontWeight: 'bold'
            }}
          />
        </Form.Group>
      </Form.Group>

      {/* 🔹 To Account */}
      <Form.Group controlId="formTo" className="mt-3">
        <Form.Label>Loan / Credit Account</Form.Label>
        <select
          className="form-control form-select"
          name="to"
          value={formData.to}
          onChange={handleInputChange}
        >
          {toAccounts.map((acc) => (
            <option key={acc.name} value={acc.name}>{acc.name}</option>
          ))}
        </select>

        {/* Pending loan amount */}
        <Form.Group controlId="formToPending" className="mt-2">
          <Form.Label>Pending Loan Amount</Form.Label>
          <Form.Control
            type="text"
            value={toPending.toLocaleString()}
            readOnly
            style={{
              backgroundColor: '#f8f9fa',
              color: toColor,
              fontWeight: 'bold'
            }}
          />
        </Form.Group>
      </Form.Group>

      {/* 🔹 Amount */}
      <Form.Group controlId="formAmount" className="mt-3">
        <Form.Label>Payment Amount</Form.Label>
        <Form.Control
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          isInvalid={!!error}
          required
        />
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </Form.Group>

      {/* 🔹 Note */}
      <Form.Group controlId="formNote" className="mt-3">
        <Form.Label>Note</Form.Label>
        <Form.Control
          type="text"
          name="note"
          value={formData.note}
          onChange={handleInputChange}
        />
      </Form.Group>

      {/* 🔹 Date */}
      <Form.Group controlId="formDate" className="mt-3">
        <Form.Label style={{ marginRight: '10px' }}>Transaction Date</Form.Label>
        <DatePicker selected={formData.date} onChange={handleDateChange} />
      </Form.Group>

      {/* 🔹 Submit */}
      <div className="d-flex justify-content-center mt-4">
        <Button variant="primary" type="submit">
          Pay Loan
        </Button>
      </div>

      {success && <div className="text-success mt-3">{success}</div>}
    </Form>
  );
};

export default NewTransactionLoanPayment;
