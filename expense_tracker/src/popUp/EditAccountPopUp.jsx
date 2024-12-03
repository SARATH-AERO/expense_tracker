import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppContext } from '../context/AppContext';

const EditAccountPopUP = ({ show, onClose, account }) => {
    const { editAccount, deleteAccount } = useContext(AppContext);
    const [name, setName] = useState('');
    const [money, setMoney] = useState('');
    const [group, setGroup] = useState('Cash');
    const [showSuccess, setShowSuccess] = useState('');

    useEffect(() => {
        if (account) {
            setName(account.name);
            setMoney(account.money);
            setGroup(account.group);
        }
    }, [account]);

    const handleSubmit = (e) => {
        e.preventDefault();
        editAccount({ ...account, name, money, group });
        setShowSuccess('update');
    };

    const handleDelete = () => {
        deleteAccount(account.name);
        setShowSuccess('delete');
        // onClose();
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
                    border: 1px solid #ced4da;
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
                    border: 1px solid #ced4da;
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
                    <h2 className="mb-4">Edit Account</h2>
                    <hr />
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="required">Name:</label>
                            <input type="text" className="form-control" id="name" placeholder="Account Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="group">Group:</label>
                            <select className="form-control form-select" id="group" value={group} onChange={(e) => setGroup(e.target.value)}>
                                <option value="Cash">Cash</option>
                                <option value="Loan">Loan</option>
                                <option value="Credit">Credit</option>
                                <option value="Bank Account">Bank Account</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="money">Money:</label>
                            <input type="number" className="form-control" id="money" placeholder="Amount" value={money} onChange={(e) => setMoney(e.target.value)} required />
                        </div>
                        <div className="d-flex justify-content-center mt-4">
                         { showSuccess != 'delete' &&   <button type="submit" className="btn btn-primary me-4">Update Account</button>  }
                            <button type="button" className="btn btn-danger me-4" onClick={handleDelete}>Delete</button>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        </div>
                    </form>
                    {showSuccess == 'update' &&  (
                        <div className="success-popup mt-3">
                            <p>Account Updated Successfully</p>
                        </div>
                    )}
                    {showSuccess == 'delete' &&  (
                        <div className="success-popup mt-3">
                            <p>Account Deleted Successfully</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditAccountPopUP;