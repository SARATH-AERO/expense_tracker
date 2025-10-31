import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { AppContext } from '../context/AppContext';

const FilterModal = ({ show, applyFilters, handleClose, initialFilters = {}, accounts: propAccounts }) => {
  const { accounts: ctxAccounts, transactions = [], currentUser } = useContext(AppContext);

  // Use accounts passed as prop (Transactions page) if provided, otherwise fall back to context
  const allAccounts = propAccounts || ctxAccounts || [];

  // Filter accounts by current user (guard when accounts is undefined)
  const userAccounts = useMemo(() => (allAccounts || []).filter(acc => acc.userId === currentUser?.id), [allAccounts, currentUser?.id]);
  
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  // a small counter used as a key to force remount react-select controls when resetting
  const [resetKey, setResetKey] = useState(0);

  // Memoize account options so identity is stable and we don't trigger effects unnecessarily
  const accountOptions = useMemo(() => {
    return (userAccounts || []).map(account => ({
      value: account.name,
      label: `${account.name} (${account.group})`
    }));
  }, [userAccounts]);

  // Generate unique tags from user's transactions and memoize tagOptions
  const uniqueTags = useMemo(() => {
    if (!Array.isArray(transactions) || !currentUser) return [];
    return [...new Set(
      transactions
        .filter(t => t.userId === currentUser.id)
        .map(t => t.tag)
        .filter(Boolean)
    )];
  }, [transactions, currentUser?.id]);

  const tagOptions = useMemo(() => uniqueTags.map(tag => ({ value: tag, label: tag })), [uniqueTags]);

  const transactionTypeOptions = useMemo(() => [
    { value: 'Expense', label: 'Expense' },
    { value: 'Income', label: 'Income' },
    { value: 'Self-Transfer', label: 'Self-Transfer' },
    { value: 'Loan Payment', label: 'Loan Payment' }
  ], []);

  const handleReset = () => {
    setSelectedAccounts([]);
    setSelectedTags([]);
    setSelectedTypes([]);
    setDateRange([null, null]);
    setAmountRange({ min: '', max: '' });
    // bump key to force Select remount and clear internal input state
    setResetKey(k => k + 1);
    // also apply empty filters so parent immediately sees cleared filters
    applyFilters({
      accounts: [],
      tags: [],
      types: [],
      dateRange: { start: null, end: null },
      amountRange: { min: null, max: null },
      userId: currentUser?.id
    });
  };

  // auto-reset when modal is closed so reopened modal shows cleared state
  useEffect(() => {
    if (!show) {
      // keep state in sync when parent hides modal
      setSelectedAccounts([]);
      setSelectedTags([]);
      setSelectedTypes([]);
      setDateRange([null, null]);
      setAmountRange({ min: '', max: '' });
      setResetKey(k => k + 1);
    }
    // intentionally only react to `show` changes
  }, [show]);

  // When modal opens, populate selects from initialFilters so user sees applied filters
  useEffect(() => {
    if (!show) return;

    // Accounts: map initialFilters.accounts (array of account names) to accountOptions
    if (initialFilters.accounts && initialFilters.accounts.length > 0 && accountOptions.length > 0) {
      const matched = accountOptions.filter(opt => initialFilters.accounts.includes(opt.value));
      setSelectedAccounts(matched);
    } else {
      setSelectedAccounts([]);
    }

    // Tags: map initialFilters.tags (array of tag strings) to tagOptions
    if (initialFilters.tags && initialFilters.tags.length > 0) {
      const matchedTags = tagOptions.filter(opt => initialFilters.tags.includes(opt.value));
      setSelectedTags(matchedTags);
    } else {
      setSelectedTags([]);
    }

    // Types: map initialFilters.types to transactionTypeOptions
    if (initialFilters.types && initialFilters.types.length > 0) {
      const matchedTypes = transactionTypeOptions.filter(opt => initialFilters.types.includes(opt.value));
      setSelectedTypes(matchedTypes);
    } else {
      setSelectedTypes([]);
    }

    // Date range
    if (initialFilters.dateRange) {
      setDateRange([initialFilters.dateRange.start || null, initialFilters.dateRange.end || null]);
    } else {
      setDateRange([null, null]);
    }

    // Amount range
    if (initialFilters.amountRange) {
      setAmountRange({ min: initialFilters.amountRange.min ?? '', max: initialFilters.amountRange.max ?? '' });
    } else {
      setAmountRange({ min: '', max: '' });
    }

    // NOTE: remove unconditional resetKey bump here to avoid remount loop.
    // If you need to force-clear react-select internals on open, consider doing so only when the incoming filters differ from current state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initialFilters, accountOptions, tagOptions]);

  const handleApply = () => {
  applyFilters({
    accounts: selectedAccounts.map(opt => opt.value),
    tags: selectedTags.map(opt => opt.value),
    types: selectedTypes.map(opt => opt.value),
    dateRange: {
      start: startDate,
      end: endDate
    },
    amountRange: {
      min: amountRange.min ? parseFloat(amountRange.min) : null,
      max: amountRange.max ? parseFloat(amountRange.max) : null
    },
    userId: currentUser?.id
  });
  handleClose();
};


  const customStyles = {
    control: (base) => ({
      ...base,
      marginBottom: '10px'
    })
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Filter Transactions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Accounts</Form.Label>
            <Select
              isMulti
              key={`accounts-${resetKey}`}
              options={accountOptions}
              value={selectedAccounts}
              onChange={setSelectedAccounts}
              styles={customStyles}
              placeholder="Select accounts..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Transaction Types</Form.Label>
            <Select
              isMulti
              key={`types-${resetKey}`}
              options={transactionTypeOptions}
              value={selectedTypes}
              onChange={setSelectedTypes}
              styles={customStyles}
              placeholder="Select transaction types..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categories</Form.Label>
            <Select
              isMulti
              key={`tags-${resetKey}`}
              options={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
              styles={customStyles}
              placeholder="Select categories..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date Range</Form.Label>
            <div className="d-flex gap-2">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="form-control"
                placeholderText="Select date range..."
                isClearable={true}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount Range</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number"
                placeholder="Min amount"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
              />
              <Form.Control
                type="number"
                placeholder="Max amount"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleReset}>
          Reset Filters
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
