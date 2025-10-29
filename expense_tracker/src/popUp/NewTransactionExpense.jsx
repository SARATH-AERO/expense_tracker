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
  const { transactions, addTransaction, accounts, setAccounts } = useContext(AppContext);
  const [formData, setFormData] = useState({
    from: accounts.length > 0 ? accounts[0].name : '',
    amount: '',
    tag: 'Groceries',
    date: new Date(),
    note: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState(0);

  const toAccounts = accounts.filter(account => account.group !== 'Loan');

  useEffect(() => {
    if (accounts.length > 0 && formData.from === '') {
      setFormData(prevState => ({
        ...prevState,
        from: accounts[0].name
      }));
    }
  }, [accounts]);

   useEffect(() => {
    const selectedAccount = accounts.find(acc => acc.name === formData.from);
    if (selectedAccount) {
      setBalance(selectedAccount.amount);
    }
  }, [formData.from, accounts]);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    const account = accounts.find(acc => acc.name === formData.from);
    const amount = parseFloat(formData.amount);

    if (account.group === 'Cash' || account.group === 'Bank Account') {
      if (amount > account.amount) {
        setError('Not enough amount');
        return;
      } else {
        account.amount -= amount;
      }
    } else if (account.group === 'Credit') {
      account.amount += amount;
    }

    setAccounts([...accounts]);
    addTransaction({
      from: formData.from,
      amount: formData.amount,
      tag: formData.tag,
      date: formData.date,
      note: formData.note,
      transType : 'Expense'
    });
    setError('');
    setSuccess('Expense amount spent successful');
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