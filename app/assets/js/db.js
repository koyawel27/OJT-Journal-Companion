(function () {
  const DB_NAME = "ojt-journal-companion";
  const DB_VERSION = 4;
  const stores = {
    studentProfile: "studentProfile",
    companyProfile: "companyProfile",
    appSettings: "appSettings",
    ojtWeeks: "ojtWeeks",
    dailyLogs: "dailyLogs",
    dailyTasks: "dailyTasks",
    photoAttachments: "photoAttachments"
  };

  function createMissingStores(db) {
    Object.values(stores).forEach((storeName) => {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    });
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("This browser does not support IndexedDB."));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        createMissingStores(request.result);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error("IndexedDB could not be opened."));
      };

      request.onblocked = () => {
        reject(new Error("Please close other open copies of this app, then try again."));
      };
    });
  }

  window.OJTDB = {
    openDatabase,
    stores
  };
})();
