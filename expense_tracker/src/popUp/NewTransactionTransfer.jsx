import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';

const NewTransactionTransfer = () => {
  const { accounts, setAccounts, transactions, addTransaction } = useContext(AppContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
    date: new Date(),
    note: ''
  });

  const [fromBalance, setFromBalance] = useState(0);
  const [toBalance, setToBalance] = useState(0);

  // Available accounts for transfer
  const validAccounts = accounts.filter(
    acc => acc.group === 'Cash' || acc.group === 'Bank Account'
  );

  // Initialize dropdowns on first load
  useEffect(() => {
    if (validAccounts.length > 0) {
      const defaultFrom = validAccounts[0].name;
      const defaultTo = validAccounts.length > 1 ? validAccounts[1].name : validAccounts[0].name;

      setFormData(prev => ({
        ...prev,
        from: defaultFrom,
        to: defaultTo
      }));

      const fromAcc = validAccounts.find(acc => acc.name === defaultFrom);
      const toAcc = validAccounts.find(acc => acc.name === defaultTo);

      setFromBalance(fromAcc ? fromAcc.amount : 0);
      setToBalance(toAcc ? toAcc.amount : 0);
    }
  }, [accounts]);

  // Update balances when dropdowns change
  useEffect(() => {
    const fromAcc = accounts.find(acc => acc.name === formData.from);
    const toAcc = accounts.find(acc => acc.name === formData.to);
    setFromBalance(fromAcc ? fromAcc.amount : 0);
    setToBalance(toAcc ? toAcc.amount : 0);
  }, [formData.from, formData.to, accounts]);

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

    const fromAccount = accounts.find(acc => acc.name === formData.from);
    const toAccount = accounts.find(acc => acc.name === formData.to);
    const amount = parseFloat(formData.amount);

    if (!fromAccount || !toAccount) {
      setError('Invalid accounts selected');
      return;
    }

    if (formData.from === formData.to) {
      setError('From and To accounts cannot be the same');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    if (amount > fromAccount.amount) {
      setError('Not enough balance in source account');
      return;
    }

    // Update balances
    fromAccount.amount -= amount;
    toAccount.amount += amount;

    setAccounts([...accounts]);

    addTransaction({
      from: formData.from,
      amount: formData.amount,
      tag: formData.to,
      date: formData.date,
      note: formData.note,
      transType: 'Self-Transfer'
    });

    setSuccess('Transfer successful');
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
