// create the variable for db connection
let db;

// establish a connection to IndexedDB set to version 1
const request = indexedDB.open("budget_tracker", 1);

// will upgrade the database version if needed
request.onupgradeneeded = function (event) {
  // save reference to the database
  const db = event.target.result;
  // create an object store
  db.createObjectStore("new transaction", { autoIncrement: true });
};

// when the connection is successful
request.onsuccess = function (event) {
  // when db is created successfully created
  db = event.target.result;

  // check if app is online, if yes upload the transaction
  if (navigator.onLine) {
    // uploadTransaction();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// this function will be executed when an attempt is made to submit a new transaction
function saveRecord(record) {
  const transaction = db.transaction(["new_entry"], "readwrite");
  const budgetObjectStore = transaction.objectStore("new_entry");
  budgetObjectStore.add(record);
}

function uploadEntries() {
  // open a transaction on the db
  const transaction = db.transaction(["new_entry"], "readwrite");
  // access the object store
  const budgetObjectStore = transaction.objectStore("new_entry");
  // get all records
  const getAll = budgetObjectStore.getAll();
  // once the .getAll is successful
  getAll.onsucess = function () {
    // if there was data in the object store, send it to the server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open another transaction
          const transaction = db.transaction(["new_entry"], "readwrite");
          // access the new object store
          const budgetObjectStore = transaction.objectStore("new_pizza");
          // clear all items in the store
          budgetObjectStore.clear();

          alert("All saved budget entries have been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadEntries);
