import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';

const NewTransactionTransfer = () => {
  const { accounts, setAccounts, addTransaction, currentUser } = useContext(AppContext);
  
  // Filter accounts by current user (guard when accounts is undefined)
  const userAccounts = (accounts || []).filter(acc => acc.userId === currentUser?.id);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
    date: new Date(),
    note: '',
    userId: currentUser?.id
  });

  const [fromBalance, setFromBalance] = useState(0);
  const [toBalance, setToBalance] = useState(0);

  // Available accounts for transfer (only Cash and Bank accounts)
  const validAccounts = userAccounts.filter(
    acc => acc.group === 'Cash' || acc.group === 'Bank Account'
  );

  // Initialize dropdowns with user's accounts
  useEffect(() => {
    if (validAccounts.length > 0) {
      const defaultFrom = validAccounts[0].name;
      const defaultTo = validAccounts.length > 1 ? validAccounts[1].name : validAccounts[0].name;

      // Only update formData if values actually change to avoid infinite setState loops
      setFormData(prev => {
        const sameFrom = prev.from === defaultFrom;
        const sameTo = prev.to === defaultTo;
        const sameUser = prev.userId === currentUser?.id;
        if (sameFrom && sameTo && sameUser) return prev; // no change
        return {
          ...prev,
          from: defaultFrom,
          to: defaultTo,
          userId: currentUser?.id
        };
      });

      const fromAcc = validAccounts.find(acc => acc.name === defaultFrom);
      const toAcc = validAccounts.find(acc => acc.name === defaultTo);

      // Only update balances when they differ
      const newFromBalance = fromAcc ? fromAcc.amount : 0;
      const newToBalance = toAcc ? toAcc.amount : 0;
      setFromBalance(prev => (prev === newFromBalance ? prev : newFromBalance));
      setToBalance(prev => (prev === newToBalance ? prev : newToBalance));
    }
  }, [validAccounts, currentUser]);

  // Update balances when selections change
  useEffect(() => {
    const fromAcc = userAccounts.find(acc => acc.name === formData.from);
    const toAcc = userAccounts.find(acc => acc.name === formData.to);
    setFromBalance(fromAcc ? fromAcc.amount : 0);
    setToBalance(toAcc ? toAcc.amount : 0);
  }, [formData.from, formData.to, userAccounts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const fromAccount = userAccounts.find(acc => acc.name === formData.from);
    const toAccount = userAccounts.find(acc => acc.name === formData.to);
    const amount = parseFloat(formData.amount);

    // Validation checks
    if (!fromAccount || (!toAccount && formData.to !== 'Others')) {
      setError('Invalid account selection');
      return;
    }

    if (formData.from === formData.to) {
      setError('Cannot transfer to same account');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    if (amount > fromAccount.amount) {
      setError('Insufficient balance');
      return;
    }

    // Update account balances
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === fromAccount.id) {
        return { ...acc, amount: acc.amount - amount };
      }
      if (formData.to !== 'Others' && acc.id === toAccount.id) {
        return { ...acc, amount: acc.amount + amount };
      }
      return acc;
    });

    setAccounts(updatedAccounts);

    // Add transaction with user context
    addTransaction({
      ...formData,
      amount: amount,
      userId: currentUser?.id,
      fromAccountId: fromAccount.id,
      toAccountId: formData.to !== 'Others' ? toAccount?.id : null,
      transType: formData.to === 'Others' ? 'Transfer-Out' : 'Self-Transfer',
      createdAt: new Date().toISOString()
    });

    setSuccess('Transfer completed successfully');
    
    // Reset form partially
    setFormData(prev => ({
      ...prev,
      amount: '',
      note: ''
    }));
  };

  return (
    <Form onSubmit={validateAndSubmit}>
      {/* From Account */}
      <Form.Group controlId="formFrom">
        <Form.Label>From Account</Form.Label>
        <select
          className="form-control form-select"
          name="from"
          value={formData.from}
          onChange={handleInputChange}
        >
          {validAccounts.map(acc => (
            <option key={acc.name} value={acc.name}>{acc.name}</option>
          ))}
        </select>
      </Form.Group>

      {/* From Account Balance */}
      <Form.Group controlId="formFromBalance">
        <Form.Label>Available Balance</Form.Label>
        <Form.Control
          type="text"
          value={fromBalance}
          readOnly
          style={{
            backgroundColor: '#f8f9fa',
            fontWeight: 'bold',
            color: fromBalance < 0 ? 'red' : 'green',
            marginBottom: '10px'
          }}
        />
      </Form.Group>

      {/* To Account */}
      <Form.Group controlId="formTo">
        <Form.Label>To Account</Form.Label>
        <select
          className="form-control form-select"
          name="to"
          value={formData.to}
          onChange={handleInputChange}
        >
          {validAccounts.map(acc => (
            <option key={acc.name} value={acc.name}>{acc.name}</option>
          ))}
          <option value="Others">Others</option>
        </select>
      </Form.Group>

      {/* To Account Balance */}
      {formData.to !== 'Others' && (
        <Form.Group controlId="formToBalance">
          <Form.Label>Available Balance</Form.Label>
          <Form.Control
            type="text"
            value={toBalance}
            readOnly
            style={{
              backgroundColor: '#f8f9fa',
              fontWeight: 'bold',
              color: toBalance < 0 ? 'red' : 'green',
              marginBottom: '10px'
            }}
          />
        </Form.Group>
      )}

      {/* Amount */}
      <Form.Group controlId="formAmount">
        <Form.Label>Amount</Form.Label>
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

      {/* Note */}
      <Form.Group controlId="formNote">
        <Form.Label>Note</Form.Label>
        <Form.Control
          type="text"
          name="note"
          value={formData.note}
          onChange={handleInputChange}
        />
      </Form.Group>

      {/* Date */}
      <Form.Group controlId="formDate">
        <Form.Label style={{ marginTop: '20px', marginRight: '10px' }}>
          Transaction Date
        </Form.Label>
        <DatePicker selected={formData.date} onChange={handleDateChange} />
      </Form.Group>

      {/* Submit */}
      <div className="d-flex justify-content-center mt-3">
        <Button variant="primary" type="submit">
          Add Transfer
        </Button>
      </div>

      {success && <div className="text-success mt-3">{success}</div>}
    </Form>
  );
};

export default NewTransactionTransfer;
