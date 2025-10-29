import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';

const NewTransactionIncome = ({ handleSubmit }) => {
  const { accounts, setAccounts, addTransaction } = useContext(AppContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
    tag: '',
    date: new Date(),
    note: ''
  });

  const [selectedBalance, setSelectedBalance] = useState(0);

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

  useEffect(() => {
    if (accounts.length > 0) {
      if (!formData.from) {
        handleInputChange({ target: { name: 'from', value: 'Salary' } });
      }
      if (!formData.to) {
        const defaultAccount = accounts[0];
        handleInputChange({ target: { name: 'to', value: defaultAccount.name } });
        setSelectedBalance(defaultAccount.amount);
      }
    }
  }, [accounts]);

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const toAccount = accounts.find(acc => acc.name === formData.to);
    const amount = parseFloat(formData.amount);

    if (!toAccount) {
      setError('Selected account not found');
      return;
    }

    toAccount.amount += amount;
    setAccounts([...accounts]);
    setSelectedBalance(toAccount.amount);

    addTransaction({
      from: formData.from,
      to: formData.to,
      amount: formData.amount,
      tag: formData.to,
      date: formData.date,
      note: formData.note,
      transType: 'Income'
    });

    setSuccess('Income added successfully');
    setFormData({ ...formData, amount: '', note: '' });
  };

  const toAccounts = accounts.filter(account => account.group === 'Cash' || account.group === 'Bank Account');

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
