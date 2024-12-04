import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';

const NewTransactionIncome = ({ handleSubmit }) => {
  const { accounts, setAccounts, addTransaction, transactions } = useContext(AppContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    from: '',
    amount: '',
    tag: '',
    date: new Date(),
    note: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        handleInputChange({ target: { name: 'to', value: accounts[0].name } });
      }
    }
  }, [accounts, formData.from, formData.to]);

//     useEffect ( () => {
//     console.log(accounts);
//     console.log(transactions);
//   }, [accounts, transactions]);

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setSuccess('');

    const toAccount = accounts.find(acc => acc.name === formData.to);
    const amount = parseFloat(formData.amount);

    if (!toAccount) {
      setError('Selected account not found');
      return;
    }

    toAccount.amount += amount;

    setAccounts([...accounts]);
    addTransaction({
      from: formData.from,
      amount: formData.amount,
      tag: formData.to,
      date: formData.date,
      note: formData.note,
      transType : 'Income'
    });

    setError('');
    setSuccess('Income added successfully');
  };

  const toAccounts = accounts.filter(account => account.group === 'Cash' || account.group === 'Bank Account');

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
      <Form.Group controlId="formTo">
        <Form.Label>To</Form.Label>
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
      </Form.Group>
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
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="formNote">
        <Form.Label>Note</Form.Label>
        <Form.Control
          type="text"
          name="note"
          value={formData.note}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="formDate">
        <Form.Label style={{marginTop:'20px', marginRight:'10px'}}  >Date</Form.Label>
        <DatePicker selected={formData.date} onChange={handleDateChange} />
      </Form.Group>
      <div className="d-flex justify-content-center mt-3">
        <Button variant="primary" type="submit">
          Add Income
        </Button>
      </div>
      {success && <div className="text-success mt-3">{success}</div>}
    </Form>
  );
};

export default NewTransactionIncome;