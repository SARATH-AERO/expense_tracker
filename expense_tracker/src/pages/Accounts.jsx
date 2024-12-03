import React, { useState, useContext } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaPlus, FaEdit } from 'react-icons/fa';
import AddPopUp from '../popUp/AddAccountPopUP';
import EditAccountPopUP from '../popUp/EditAccountPopUp';
import {AppContext, AppProvider} from '../context/AppContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaMoneyBillWave, FaUniversity, FaCreditCard, FaPiggyBank } from 'react-icons/fa';

const Accounts = () => {
    const [addPopShow, setAddPopShow] = useState(false);
    const [editPopShow, setEditPopShow] = useState(false);
    const { accounts } = useContext(AppContext);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const handleShow = () => {
        setAddPopShow(!addPopShow);
    }
    const handleClose = () => {
        setAddPopShow(false);
        setEditPopShow(false);
    }

    // Initialize groupedAccounts with all possible groups
    const groupedAccounts = {
        Cash: [],
        'Bank Account': [],
        Loan: [],
        Credit: [],
        ...accounts.reduce((acc, account) => {
            if (!acc[account.group]) {
                acc[account.group] = [];
            }
            acc[account.group].push(account);
            return acc;
        }, {})
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
        const total = groupedAccounts[group].reduce((sum, account) => sum + parseFloat(account.money), 0);
        return total;
      };
    
      const formatAmount = (amount, group) => {
        const isPositive = group === 'Cash' || group === 'Bank Account';
        const formattedAmount = isPositive ? `+${amount}` : `-${amount}`;
        const color = isPositive ? '#21BA45' : 'red';
        return <span style={{ color , fontWeight:'500',fontSize: '20px', fontFamily:'Roboto Mono, monospace'}}>{formattedAmount}</span>;
      };

      const handleEdit = (account) => {
        setSelectedAccount(account);
        setEditPopShow(true);
      };


    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', margin: 0, padding: 0 }}>
            <div style={{ width: '100%', margin: 0, padding: 0 }}>
                <Table striped bordered hover style={{ margin: 0 }}>
                    <tbody>
                        <tr>
                            <td>
                                {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
                                <Button variant="primary" onClick={handleShow} style={{ display: 'flex', alignItems: 'center' }}>
                                    <FaPlus style={{ marginRight: '8px' }} /> NEW
                                </Button>
                                {/* </div> */}
                            </td>
                        </tr>
                        {Object.keys(groupedAccounts).map((group, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td style={{ backgroundColor: '#2F3E8A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {getIcon(group)} <span style={{ marginLeft: '8px' }}>{group}</span>
                    </div>
                    <div>
                      {formatAmount(getTotalAmount(group), group)}
                    </div>
                  </td>
                </tr>
                {groupedAccounts[group].length > 0 ? (
                  groupedAccounts[group].map((account, idx) => (
                    <tr key={idx}>
                      <td style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{account.name}</span>
                        <span style={{}}> {formatAmount(account.money, group)}</span>
                        <Button variant="primary" onClick={() => handleEdit(account)} style={{ display: 'flex', alignItems: 'center' }}>
                            <FaEdit style={{ cursor: 'pointer', marginRight: '8px' }}  /> 
                                     EDIT
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>No accounts</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
        {addPopShow && <AddPopUp show={addPopShow} onClose={handleClose} />}
        {editPopShow && <EditAccountPopUP show={editPopShow} onClose={handleClose} account={selectedAccount} />}
      </div>
    </div>
  );
};


export default Accounts;