import React, { useState, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppContext } from '../context/AppContext';


const AddAccountPopUP = ({ show, onClose }) => {
  const { accounts, addAccount } = useContext(AppContext);
  const [name, setName] = useState('');
  const [amount, setamount] = useState('');
  const [group, setGroup] = useState('Cash');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const accountExists = accounts.some(account => account.name === name);

    if (accountExists) {
      setError('Account name already exists');
      return;
    }

    addAccount({ name, amount, group });
    setShowSuccess(true);
    setError('');
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <style>
        {`
          .popup {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
          }

          .popup-content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            position: relative;
            width: 400px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .success-popup {
            background-color: #d4edda;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
          }

          .form-group {
            text-align: left;
          } 

          .close {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            cursor: pointer;
          }

          hr {
            margin: 20px 0;
          }

          .form-control {
            border: 1px solid #2F3E8A;
            border-radius: 0.25rem;
            padding: 0.375rem 0.75rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          }

          .form-control:focus {
            border-color: #80bdff;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .form-select {
            border: 1px solid #2F3E8A;
            border-radius: 0.25rem;
            padding: 0.375rem 0.75rem;
            background-color: #fff;
            background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"%3E%3Cpath fill="%23343a40" d="M2 0L0 2h4zm0 5L0 3h4z"/%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 8px 10px;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
          }

          .form-select:focus {
            border-color: #80bdff;
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }
        `}
      </style>
      <div className="popup">
        <div className="popup-content">
          <h2 className="mb-4">Add Account</h2>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="required">Name:</label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Account Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {error && <div className="text-danger mt-2">{error}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="group">Group:</label>
              <select
                className="form-control form-select"
                id="group"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Loan">Loan</option>
                <option value="Credit">Credit</option>
                <option value="Bank Account">Bank Account</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">amount:</label>
              <input
                type="number"
                className="form-control"
                id="amount"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setamount(e.target.value)}
                required
              />
            </div>
            <div className="d-flex justify-content-center mt-3">
              <button type="submit" className="btn btn-primary me-4">Save Account</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </form>
          {showSuccess && (
            <div className="success-popup mt-3">
              <p>New Account Added Successfully</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAccountPopUP;