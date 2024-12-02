import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

const AccountsPage = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAppContext();
  const [showPopup, setShowPopup] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    money: "",
    group: "Cash",
  });

  const handleAddAccount = () => {
    if (isEdit) {
      updateAccount({ ...currentAccount, ...formData });
    } else {
      const newAccount = { ...formData, id: Date.now() }; // Unique ID for each account
      addAccount(newAccount);
    }
    setShowPopup(false);
    setFormData({ name: "", money: "", group: "Cash" });
  };

  const handleEditAccount = (account) => {
    setIsEdit(true);
    setCurrentAccount(account);
    setFormData({ name: account.name, money: account.money, group: account.group });
    setShowPopup(true);
  };

  const handleDeleteAccount = (id) => {
    deleteAccount(id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div style={styles.contentWrapper}> {/* Content Wrapper */}
      {/* Add Account Pop-up */}
      {showPopup && (
        <div style={styles.popup}>
          <div style={styles.popupContent}>
            <h3>{isEdit ? "Edit Account" : "Add Account"}</h3>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Account Name"
            />
            <input
              type="number"
              name="money"
              value={formData.money}
              onChange={handleInputChange}
              placeholder="Money"
            />
            <select name="group" value={formData.group} onChange={handleInputChange}>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Savings">Savings</option>
              <option value="Loan">Loan</option>
            </select>
            <button onClick={handleAddAccount}>
              {isEdit ? "Update Account" : "Add Account"}
            </button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <table style={styles.table}>
        <tbody>
          <tr>
            <td colSpan={3}>
              <button onClick={() => setShowPopup(true)}>Add Account</button>
            </td>
          </tr>

          {/* Grouping Accounts by Type */}
          {["Cash", "Credit Card", "Savings", "Loan"].map((group) => {
            const groupAccounts = accounts.filter((account) => account.group === group);
            return (
              <React.Fragment key={group}>
                <tr>
                  <th colSpan={3}>{group}</th>
                </tr>
                {groupAccounts.map((account) => (
                  <tr key={account.id}>
                    <td style={styles.name}>{account.name}</td>
                    <td style={styles.money}>{account.money}</td>
                    <td style={styles.actions}>
                      <FaRegEdit onClick={() => handleEditAccount(account)} style={styles.icon} />
                      <FaTrashAlt onClick={() => handleDeleteAccount(account.id)} style={styles.icon} />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};




const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  name: {
    color: "blue",
    textAlign: "left",
    padding: "10px",
  },
  money: {
    textAlign: "right",
    padding: "10px",
  },
  actions: {
    textAlign: "right",
    padding: "10px",
  },
  icon: {
    cursor: "pointer",
    marginLeft: "10px",
  },
  popup: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "5px",
    width: "300px",
  },
};

export default AccountsPage;
