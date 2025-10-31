import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';

const NewTransactionIncome = ({ handleSubmit }) => {
  const { accounts, setAccounts, addTransaction, currentUser } = useContext(AppContext);
  
  // Filter accounts by current user
  const userAccounts = accounts.filter(acc => acc.userId === currentUser?.id) || [];
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    from: 'Salary',
    to: userAccounts.length > 0 ? userAccounts[0].name : '',
    amount: '',
    tag: '',
    date: new Date(),
    note: '',
    userId: currentUser?.id
  });

  const [selectedBalance, setSelectedBalance] = useState(0);

  // Filter only Cash and Bank accounts for income deposits
  const toAccounts = userAccounts.filter(account => 
    account.group === 'Cash' || account.group === 'Bank Account'
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'to') {
      const selectedAccount = accounts.find(acc => acc.name === value);
      setSelectedBalance(selectedAccount ? selectedAccount.amount : 0);
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

   // Initialize form with user's accounts
  useEffect(() => {
    if (userAccounts.length > 0 && !formData.to) {
      const defaultAccount = userAccounts[0];
      setFormData(prev => ({
        ...prev,
        to: defaultAccount.name,
        userId: currentUser?.id
      }));
      setSelectedBalance(defaultAccount.amount);
    }
  }, [userAccounts, currentUser]);

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const toAccount = userAccounts.find(acc => acc.name === formData.to);
    const amount = parseFloat(formData.amount);

    if (!toAccount) {
      setError('Selected account not found');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Update account balance
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === toAccount.id) {
        return { ...acc, amount: acc.amount + amount };
      }
      return acc;
    });
    setAccounts(updatedAccounts);
    setSelectedBalance(toAccount.amount + amount);

    // Add transaction with user context
    addTransaction({
      ...formData,
      amount: amount,
      userId: currentUser?.id,
      accountId: toAccount.id,
      transType: 'Income',
      createdAt: new Date().toISOString()
    });

    setSuccess('Income added successfully');
    
    // Reset only amount and note, keep other selections
    setFormData(prev => ({
      ...prev,
      amount: '',
      note: ''
    }));
  };


  // 🔹 Dynamic balance color logic
  const balanceColor =
    selectedBalance > 0 ? 'green' : selectedBalance < 0 ? 'red' : 'gray';

  return (
    <Form onSubmit={validateAndSubmit}>
      <Form.Group controlId="formFrom">
        <Form.Label>From</Form.Label>
        <select
          className="form-control form-select"
          name="from"
          value={formData.from}
          onChange={handleInputChange}
        >
          <option value="Salary">Salary</option>
          <option value="Others">Others</option>
          <option value="Bonus">Bonus</option>
          <option value="Cash">Cash</option>
        </select>
      </Form.Group>

      <Form.Group controlId="formTo" className="mt-3">
        <Form.Label>To Account</Form.Label>
        <select
          className="form-control form-select"
          name="to"
          value={formData.to}
          onChange={handleInputChange}
        >
          {toAccounts.map((account) => (
            <option key={account.name} value={account.name}>{account.name}</option>
          ))}
        </select>

        {/* 🔹 Non-editable text box for balance */}
        <Form.Group controlId="formBalance" className="mt-2">
          <Form.Label>Available Balance</Form.Label>
          <Form.Control
            type="text"
            value={selectedBalance.toLocaleString()}
            readOnly
            style={{
              color: balanceColor,
              fontWeight: 'bold',
              backgroundColor: '#f8f9fa'
            }}
          />
        </Form.Group>
      </Form.Group>

      <Form.Group controlId="formAmount" className="mt-3">
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

      <Form.Group controlId="formNote" className="mt-3">
        <Form.Label>Note</Form.Label>
        <Form.Control
          type="text"
          name="note"
          value={formData.note}
          onChange={handleInputChange}
        />
      </Form.Group>

      <Form.Group controlId="formDate" className="mt-3">
        <Form.Label style={{ marginRight: '10px' }}>Transaction Date</Form.Label>
        <DatePicker selected={formData.date} onChange={handleDateChange} />
      </Form.Group>

      <div className="d-flex justify-content-center mt-4">
        <Button variant="primary" type="submit">
          Add Income
        </Button>
      </div>

      {success && <div className="text-success mt-3">{success}</div>}
    </Form>
  );
};

export default NewTransactionIncome;
