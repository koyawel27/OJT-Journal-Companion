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

  async function getAllRecords(storeKey) {
    const db = await window.OJTDB.openDatabase();
    const storeName = getStoreName(storeKey);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error || new Error("Saved records could not be loaded."));
      };

      transaction.oncomplete = () => {
        db.close();
      };

      transaction.onerror = () => {
        reject(transaction.error || new Error("Saved records could not be loaded."));
      };
    });
  }

  async function saveItem(storeKey, record) {
    const db = await window.OJTDB.openDatabase();
    const storeName = getStoreName(storeKey);

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

  async function deleteItem(storeKey, id) {
    const db = await window.OJTDB.openDatabase();
    const storeName = getStoreName(storeKey);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.delete(id);

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error || new Error("The record could not be deleted."));
      };
    });
  }

  async function deleteDailyLogWithRelatedRecords(dailyLogId) {
    const db = await window.OJTDB.openDatabase();
    const dailyLogStore = getStoreName("dailyLogs");
    const dailyTaskStore = getStoreName("dailyTasks");
    const photoAttachmentStore = getStoreName("photoAttachments");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([dailyLogStore, dailyTaskStore, photoAttachmentStore], "readwrite");
      const logs = transaction.objectStore(dailyLogStore);
      const tasks = transaction.objectStore(dailyTaskStore);
      const photos = transaction.objectStore(photoAttachmentStore);
      const taskRequest = tasks.getAll();
      const photoRequest = photos.getAll();
      let tasksQueued = false;
      let photosQueued = false;

      function deleteLogWhenReady() {
        if (tasksQueued && photosQueued) {
          logs.delete(dailyLogId);
        }
      }

      taskRequest.onsuccess = () => {
        (taskRequest.result || [])
          .filter((task) => task.dailyLogId === dailyLogId)
          .forEach((task) => tasks.delete(task.id));
        tasksQueued = true;
        deleteLogWhenReady();
      };

      photoRequest.onsuccess = () => {
        (photoRequest.result || [])
          .filter((photo) => photo.dailyLogId === dailyLogId)
          .forEach((photo) => photos.delete(photo.id));
        photosQueued = true;
        deleteLogWhenReady();
      };

      taskRequest.onerror = () => {
        reject(taskRequest.error || new Error("Related task items could not be loaded."));
      };

      photoRequest.onerror = () => {
        reject(photoRequest.error || new Error("Related photo attachments could not be loaded."));
      };

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error || new Error("The daily log could not be deleted."));
      };
    });
  }

  async function replaceAllData(data) {
    const db = await window.OJTDB.openDatabase();
    const storeNames = Object.values(window.OJTDB.stores);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, "readwrite");

      storeNames.forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });

      function putSingleRecord(storeKey, record) {
        if (!record) {
          return;
        }

        transaction.objectStore(getStoreName(storeKey)).put({
          ...record,
          id: recordIds[storeKey]
        });
      }

      function putRecords(storeKey, records) {
        const store = transaction.objectStore(getStoreName(storeKey));
        (records || []).forEach((record) => {
          store.put(record);
        });
      }

      putSingleRecord("studentProfile", data.studentProfile);
      putSingleRecord("companyProfile", data.companyProfile);
      putSingleRecord("appSettings", data.appSettings);
      putRecords("ojtWeeks", data.weeks);
      putRecords("dailyLogs", data.dailyLogs);
      putRecords("dailyTasks", data.dailyTasks);
      putRecords("photoAttachments", data.photoAttachments);

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error || new Error("Backup data could not be restored."));
      };
    });
  }

  async function clearAllData() {
    const db = await window.OJTDB.openDatabase();
    const storeNames = Object.values(window.OJTDB.stores);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, "readwrite");

      storeNames.forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error || new Error("Local data could not be reset."));
      };
    });
  }

  window.OJTStorage = {
    getStudentProfile: () => getRecord("studentProfile"),
    saveStudentProfile: (data) => saveRecord("studentProfile", data),
    getCompanyProfile: () => getRecord("companyProfile"),
    saveCompanyProfile: (data) => saveRecord("companyProfile", data),
    getAppSettings: () => getRecord("appSettings"),
    saveAppSettings: (data) => saveRecord("appSettings", data),
    getWeeks: () => getAllRecords("ojtWeeks"),
    saveWeek: (week) => saveItem("ojtWeeks", week),
    deleteWeek: (id) => deleteItem("ojtWeeks", id),
    getDailyLogs: () => getAllRecords("dailyLogs"),
    saveDailyLog: (dailyLog) => saveItem("dailyLogs", dailyLog),
    deleteDailyLog: (id) => deleteDailyLogWithRelatedRecords(id),
    getDailyTasks: () => getAllRecords("dailyTasks"),
    saveDailyTask: (dailyTask) => saveItem("dailyTasks", dailyTask),
    deleteDailyTask: (id) => deleteItem("dailyTasks", id),
    getPhotoAttachments: () => getAllRecords("photoAttachments"),
    savePhotoAttachment: (photoAttachment) => saveItem("photoAttachments", photoAttachment),
    deletePhotoAttachment: (id) => deleteItem("photoAttachments", id),
    replaceAllData,
    clearAllData
  };
})();
