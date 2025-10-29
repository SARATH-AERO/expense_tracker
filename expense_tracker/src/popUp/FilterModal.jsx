import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { AppContext } from '../context/AppContext';

const FilterModal = ({ show,applyFilters ,  handleClose }) => {
  const { accounts } = useContext(AppContext);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);

  useEffect(() => {
    // console.log('Accounts:', accounts); // Debugging line
    const options = accounts.map(account1 => ({ value: account1.name, label: account1.name }));
    // console.log('Account Options:', options); // Debugging line
    setAccountOptions(options);
  }, [accounts]);

  const tagOptions = [
    { value: 'Food', label: 'Food' },
    { value: 'Groceries', label: 'Groceries' },
    { value: 'Rent', label: 'Rent' },
    { value: 'Income Tax', label: 'Income Tax' },
    { value: 'shoppings', label: 'shoppings' },
    { value: 'Food', label: 'Food' },
    { value: 'clothes', label: 'clothes' },
    { value: 'vacation', label: 'vacation' },
    { value: 'Salary', label: 'Salary' },
    { value: 'Bonus', label: 'Bonus' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Hospital', label: 'Hospital' },
    // Add more tags as needed
  ];

  const handleReset = () => {
    setSelectedAccounts([]);
    setSelectedTags([]);
  };

  const handleApply = () => {
    applyFilters(selectedAccounts.map(option => option.value), selectedTags.map(option => option.value));
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Filter Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Form>
          <Form.Group controlId="formAccounts">
            <Form.Label>Account</Form.Label>
            <Select
              isMulti
              options={accountOptions}
              value={selectedAccounts}
              onChange={setSelectedAccounts}
            />
          </Form.Group>
          <Form.Group controlId="formTags">
            <Form.Label>Category</Form.Label>
            <Select
              isMulti
              options={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;