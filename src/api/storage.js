// 持久化存储服务，使用IndexedDB存储文件数据

// IndexedDB数据库名称和版本
const DB_NAME = 'mindfileDB';
const DB_VERSION = 1;
const MATERIALS_STORE = 'materials';
const FILES_STORE = 'files';

// 打开数据库连接
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('打开数据库失败:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    // 创建数据库结构
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建资料存储对象
      if (!db.objectStoreNames.contains(MATERIALS_STORE)) {
        const materialsStore = db.createObjectStore(MATERIALS_STORE, { keyPath: 'id' });
        materialsStore.createIndex('name', 'name', { unique: false });
        materialsStore.createIndex('type', 'type', { unique: false });
        materialsStore.createIndex('uploadDate', 'uploadDate', { unique: false });
      }
      
      // 创建文件存储对象
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const filesStore = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
        filesStore.createIndex('materialId', 'materialId', { unique: false });
      }
    };
  });
};

// 保存资料信息
export const saveMaterial = async (material) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MATERIALS_STORE], 'readwrite');
      const store = transaction.objectStore(MATERIALS_STORE);
      
      const request = store.put(material);
      
      request.onsuccess = () => {
        resolve(material);
      };
      
      request.onerror = (event) => {
        console.error('保存资料失败:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('保存资料错误:', error);
    throw error;
  }
};

// 保存文件数据
export const saveFile = async (fileData) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FILES_STORE], 'readwrite');
      const store = transaction.objectStore(FILES_STORE);
      
      const request = store.put(fileData);
      
      request.onsuccess = () => {
        resolve(fileData);
      };
      
      request.onerror = (event) => {
        console.error('保存文件失败:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('保存文件错误:', error);
    throw error;
  }
};

// 获取所有资料
export const getAllMaterialsFromDB = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MATERIALS_STORE], 'readonly');
      const store = transaction.objectStore(MATERIALS_STORE);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('获取资料失败:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('获取资料错误:', error);
    return [];
  }
};

// 获取文件数据
export const getFileByMaterialId = async (materialId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FILES_STORE], 'readonly');
      const store = transaction.objectStore(FILES_STORE);
      const index = store.index('materialId');
      
      const request = index.get(materialId);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('获取文件失败:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('获取文件错误:', error);
    return null;
  }
};

// 删除资料及其关联的文件
export const deleteMaterialAndFile = async (materialId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MATERIALS_STORE, FILES_STORE], 'readwrite');
      
      // 删除资料
      const materialsStore = transaction.objectStore(MATERIALS_STORE);
      const materialRequest = materialsStore.delete(materialId);
      
      materialRequest.onerror = (event) => {
        console.error('删除资料失败:', event.target.error);
        reject(event.target.error);
      };
      
      // 删除关联的文件
      const filesStore = transaction.objectStore(FILES_STORE);
      const index = filesStore.index('materialId');
      const fileRequest = index.openCursor(IDBKeyRange.only(materialId));
      
      fileRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      fileRequest.onerror = (event) => {
        console.error('删除文件失败:', event.target.error);
        reject(event.target.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
        resolve({ success: true });
      };
    });
  } catch (error) {
    console.error('删除资料和文件错误:', error);
    throw error;
  }
};

// 搜索资料
export const searchMaterialsInDB = async (query, type = 'all') => {
  try {
    const allMaterials = await getAllMaterialsFromDB();
    
    let results = [...allMaterials];
    
    // 按关键词筛选
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(material => 
        material.name.toLowerCase().includes(lowerQuery) ||
        material.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    // 按类型筛选
    if (type !== 'all') {
      results = results.filter(material => material.type === type);
    }
    
    return results;
  } catch (error) {
    console.error('搜索资料错误:', error);
    return [];
  }
};

// 初始化数据库并加载示例数据
export const initializeDatabase = async (sampleMaterials = []) => {
  try {
    // 检查数据库是否已有数据
    const existingMaterials = await getAllMaterialsFromDB();
    
    // 如果没有数据，则添加示例数据
    if (existingMaterials.length === 0 && sampleMaterials.length > 0) {
      for (const material of sampleMaterials) {
        await saveMaterial(material);
      }
      console.log('示例数据已加载到数据库');
    }
    
    return true;
  } catch (error) {
    console.error('初始化数据库错误:', error);
    return false;
  }
};