(function () {
  const recordIds = {
    studentProfile: "student-profile",
    companyProfile: "company-profile",
    appSettings: "app-settings"
  };

  function getStoreName(storeKey) {
    return window.OJTDB.stores[storeKey];
  }

  async function getRecord(storeKey) {
    const db = await window.OJTDB.openDatabase();
    const storeName = getStoreName(storeKey);
    const recordId = recordIds[storeKey];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(recordId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error || new Error("The saved record could not be loaded."));
      };

      transaction.oncomplete = () => {
        db.close();
      };

      transaction.onerror = () => {
        reject(transaction.error || new Error("The saved record could not be loaded."));
      };
    });
  }

  async function saveRecord(storeKey, data) {
    const db = await window.OJTDB.openDatabase();
    const storeName = getStoreName(storeKey);
    const record = {
      ...data,
      id: recordIds[storeKey]
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.put(record);

      transaction.oncomplete = () => {
        db.close();
        resolve(record);
      };

      transaction.onerror = () => {
        reject(transaction.error || new Error("The record could not be saved."));
      };
    });
  }

  window.OJTStorage = {
    getStudentProfile: () => getRecord("studentProfile"),
    saveStudentProfile: (data) => saveRecord("studentProfile", data),
    getCompanyProfile: () => getRecord("companyProfile"),
    saveCompanyProfile: (data) => saveRecord("companyProfile", data),
    getAppSettings: () => getRecord("appSettings"),
    saveAppSettings: (data) => saveRecord("appSettings", data)
  };
})();
