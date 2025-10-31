import React, { useState, useContext, useMemo } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaMoneyBillWave, FaUniversity, FaCreditCard, FaPiggyBank } from 'react-icons/fa';
import AddPopUp from '../popUp/AddAccountPopUP';
import EditAccountPopUP from '../popUp/EditAccountPopUp';
import { AppContext } from '../context/AppContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Accounts = () => {
  const [addPopShow, setAddPopShow] = useState(false);
  const [editPopShow, setEditPopShow] = useState(false);
  const { accounts, currentUser } = useContext(AppContext);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Filter accounts for current user
  const userAccounts = useMemo(() => 
    accounts.filter(acc => acc.userId === currentUser?.id) || []
  , [accounts, currentUser]);

  // Initialize groupedAccounts with all possible groups
  const groupedAccounts = useMemo(() => ({
    Cash: [],
    'Bank Account': [],
    Credit: [],
    Loan: [],
    ...userAccounts.reduce((acc, account) => {
      if (!acc[account.group]) {
        acc[account.group] = [];
      }
      acc[account.group].push(account);
      return acc;
    }, {})
  }), [userAccounts]);

  const handleShow = () => setAddPopShow(true);
  const handleClose = () => {
    setAddPopShow(false);
    setEditPopShow(false);
    setSelectedAccount(null);
  };

  const getIcon = (group) => {
    switch (group) {
      case 'Cash':
        return <FaMoneyBillWave />;
      case 'Bank Account':
        return <FaPiggyBank />;
      case 'Loan':
        return <FaUniversity />;
      case 'Credit':
        return <FaCreditCard />;
      default:
        return null;
    }
  };

  const getTotalAmount = (group) => {
    return groupedAccounts[group].reduce((sum, account) => 
      sum + parseFloat(account.amount || 0), 0
    );
  };

  const getTotalNetWorth = () => {
    const assets = getTotalAmount('Cash') + getTotalAmount('Bank Account');
    const liabilities = getTotalAmount('Credit') + getTotalAmount('Loan');
    return assets - liabilities;
  };

  const formatAmount = (amount, group) => {
    const isPositive = group === 'Cash' || group === 'Bank Account';
    const formattedAmount = isPositive ? `+${amount.toLocaleString()}` : `-${amount.toLocaleString()}`;
    const color = isPositive ? '#21BA45' : 'red';
    return (
      <span style={{ 
        color, 
        fontWeight: '500', 
        fontSize: '20px', 
        fontFamily: 'Roboto Mono, monospace' 
      }}>
        ₹{formattedAmount}
      </span>
    );
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setEditPopShow(true);
  };

  const colors = {
    Cash: '#2E7D32',
    'Bank Account': '#1565C0',
    Credit: '#C62828',
    Loan: '#4A148C'
  };

  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Alert variant="info">
          Please login to view your accounts
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="row m-0">
        <div className="col-12 p-3">
          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Net Worth</h6>
                  <h4 className={getTotalNetWorth() >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{getTotalNetWorth().toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Total Assets</h6>
                  <h4 className="text-success">
                    ₹{(getTotalAmount('Cash') + getTotalAmount('Bank Account')).toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Total Liabilities</h6>
                  <h4 className="text-danger">
                    ₹{(getTotalAmount('Credit') + getTotalAmount('Loan')).toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Total Accounts</h6>
                  <h4>{userAccounts.length}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Table */}
          <Table responsive bordered hover className="shadow-sm">
            <thead>
              <tr>
                <td colSpan="3" className="bg-light">
                  <Button 
                    variant="primary" 
                    onClick={handleShow} 
                    className="d-flex align-items-center gap-2"
                  >
                    <FaPlus /> ADD NEW ACCOUNT
                  </Button>
                </td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedAccounts).map(([group, accounts]) => (
                <React.Fragment key={group}>
                  <tr>
                    <td 
                      colSpan="3" 
                      style={{ 
                        backgroundColor: colors[group] || '#666',
                        color: 'white',
                        padding: '10px'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          {getIcon(group)} 
                          <span>{group}</span>
                        </div>
                        <div>
                          Total = {formatAmount(getTotalAmount(group), group)}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {accounts.length > 0 ? (
                    accounts.map((account) => (
                      <tr key={account.id}>
                        <td>{account.name}</td>
                        <td className="text-end">
                          {formatAmount(account.amount, group)}
                        </td>
                        <td className="text-end">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEdit(account)}
                            className="d-flex align-items-center gap-2"
                          >
                            <FaEdit /> EDIT
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        No {group.toLowerCase()} accounts
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <AddPopUp 
        show={addPopShow} 
        onClose={handleClose}
      />
      
      {editPopShow && (
        <EditAccountPopUP 
          show={editPopShow} 
          onClose={handleClose} 
          account={selectedAccount}
        />
      )}
    </div>
  );
};

export default Accounts;