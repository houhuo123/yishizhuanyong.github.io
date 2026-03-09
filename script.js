// 全局变量
let medicines = [];
let inboundRecords = [];
let outboundRecords = [];
let suppliers = [];
let customers = [];
let categories = [];
let settings = {
    lowStockThreshold: 10,
    defaultUnit: 'g'
};

// DOM元素
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalForm = document.getElementById('modal-form');
const closeModal = document.querySelector('.close');

// 初始化
function init() {
    loadData();
    setupEventListeners();
    renderDashboard();
    renderInventory();
    renderInbound();
    renderOutbound();
    renderSuppliers();
    renderCustomers();
    renderStatistics();
    updateCategorySelect();
}

// 加载数据
function loadData() {
    const savedMedicines = localStorage.getItem('medicines');
    const savedInbound = localStorage.getItem('inboundRecords');
    const savedOutbound = localStorage.getItem('outboundRecords');
    const savedSuppliers = localStorage.getItem('suppliers');
    const savedCustomers = localStorage.getItem('customers');
    const savedSettings = localStorage.getItem('settings');
    
    if (savedMedicines) {
        medicines = JSON.parse(savedMedicines);
    } else {
        // 初始化示例数据
        initSampleData();
    }
    
    if (savedInbound) {
        inboundRecords = JSON.parse(savedInbound);
    }
    
    if (savedOutbound) {
        outboundRecords = JSON.parse(savedOutbound);
    }
    
    if (savedSuppliers) {
        suppliers = JSON.parse(savedSuppliers);
    } else {
        // 初始化示例供应商数据
        initSampleSuppliers();
    }
    
    if (savedCustomers) {
        customers = JSON.parse(savedCustomers);
        // 确保所有客户都有medicalRecord属性，并更新为新的结构
        customers.forEach(customer => {
            if (!customer.medicalRecord) {
                customer.medicalRecord = {
                    clinicalPresentation: '',
                    prescriptions: []
                };
            } else {
                // 转换旧结构到新结构
                if (customer.medicalRecord.symptoms || customer.medicalRecord.history || customer.medicalRecord.previousTreatment || customer.medicalRecord.currentMedication || customer.medicalRecord.doctorAdvice) {
                    // 将旧字段内容合并到临床表现
                    let clinicalPresentation = '';
                    if (customer.medicalRecord.symptoms) clinicalPresentation += `症状：${customer.medicalRecord.symptoms}\n`;
                    if (customer.medicalRecord.history) clinicalPresentation += `病史：${customer.medicalRecord.history}\n`;
                    if (customer.medicalRecord.previousTreatment) clinicalPresentation += `既往治疗：${customer.medicalRecord.previousTreatment}\n`;
                    if (customer.medicalRecord.currentMedication) clinicalPresentation += `当前用药：${customer.medicalRecord.currentMedication}\n`;
                    if (customer.medicalRecord.doctorAdvice) clinicalPresentation += `医生建议：${customer.medicalRecord.doctorAdvice}\n`;
                    
                    customer.medicalRecord.clinicalPresentation = clinicalPresentation;
                    // 移除旧字段
                    delete customer.medicalRecord.symptoms;
                    delete customer.medicalRecord.history;
                    delete customer.medicalRecord.previousTreatment;
                    delete customer.medicalRecord.currentMedication;
                    delete customer.medicalRecord.doctorAdvice;
                }
                // 确保prescriptions数组存在
                if (!customer.medicalRecord.prescriptions) {
                    customer.medicalRecord.prescriptions = [];
                }
            }
        });
        saveData();
    } else {
        // 初始化示例客户数据
        initSampleCustomers();
    }
    
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        document.getElementById('low-stock-threshold').value = settings.lowStockThreshold;
        document.getElementById('default-unit').value = settings.defaultUnit;
    }
    
    // 提取分类
    categories = [...new Set(medicines.map(m => m.category))];
}

// 初始化示例数据
function initSampleData() {
    const sampleMedicines = [
        { id: 1, name: '当归', pinyin: 'danggui', initial: 'D', category: '补血药', stock: 100, unit: 'g', price: 50 },
        { id: 2, name: '黄芪', pinyin: 'huangqi', initial: 'H', category: '补气药', stock: 150, unit: 'g', price: 30 },
        { id: 3, name: '川芎', pinyin: 'chuanxiong', initial: 'C', category: '活血药', stock: 80, unit: 'g', price: 40 },
        { id: 4, name: '白芍', pinyin: 'baishao', initial: 'B', category: '补血药', stock: 120, unit: 'g', price: 35 },
        { id: 5, name: '熟地', pinyin: 'shudi', initial: 'S', category: '补血药', stock: 90, unit: 'g', price: 45 }
    ];
    
    medicines = sampleMedicines;
    saveData();
}

// 初始化示例供应商数据
function initSampleSuppliers() {
    const sampleSuppliers = [
        { id: 1, name: '北京中药饮片厂', contact: '张三', phone: '13800138001', address: '北京市朝阳区' },
        { id: 2, name: '上海中药材公司', contact: '李四', phone: '13900139001', address: '上海市浦东新区' },
        { id: 3, name: '广州中药批发市场', contact: '王五', phone: '13700137001', address: '广州市白云区' }
    ];
    
    suppliers = sampleSuppliers;
    saveData();
}

// 初始化示例客户数据
function initSampleCustomers() {
    const sampleCustomers = [
        { 
            id: 1, 
            name: '赵先生', 
            gender: '男', 
            age: 45, 
            phone: '13500135001', 
            address: '北京市海淀区',
            medicalRecord: {
                clinicalPresentation: '症状：头晕、乏力\n病史：高血压\n既往治疗：服用降压药\n医生建议：注意休息，按时服药',
                prescriptions: []
            }
        },
        { 
            id: 2, 
            name: '李女士', 
            gender: '女', 
            age: 38, 
            phone: '13600136001', 
            address: '上海市静安区',
            medicalRecord: {
                clinicalPresentation: '症状：失眠、多梦\n病史：神经衰弱\n既往治疗：中药调理\n医生建议：保持心情舒畅，规律作息',
                prescriptions: []
            }
        },
        { 
            id: 3, 
            name: '王大爷', 
            gender: '男', 
            age: 65, 
            phone: '13400134001', 
            address: '广州市天河区',
            medicalRecord: {
                clinicalPresentation: '症状：关节疼痛\n病史：关节炎\n既往治疗：针灸治疗\n医生建议：注意保暖，避免过度劳累',
                prescriptions: []
            }
        }
    ];
    
    customers = sampleCustomers;
    saveData();
}

// 保存数据
function saveData() {
    localStorage.setItem('medicines', JSON.stringify(medicines));
    localStorage.setItem('inboundRecords', JSON.stringify(inboundRecords));
    localStorage.setItem('outboundRecords', JSON.stringify(outboundRecords));
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('settings', JSON.stringify(settings));
}

// 设置事件监听器
function setupEventListeners() {
    // 导航切换
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            switchSection(target);
        });
    });
    
    // 关闭弹窗
    closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', function(e) {
        if (e.target == modal) {
            closeModalFunc();
        }
    });
    
    // 新增中药
    document.getElementById('add-medicine-btn').addEventListener('click', function() {
        openAddMedicineModal();
    });
    
    // 新增入库
    document.getElementById('add-inbound-btn').addEventListener('click', function() {
        openAddInboundModal();
    });
    
    // 新增出库
    document.getElementById('add-outbound-btn').addEventListener('click', function() {
        openAddOutboundModal();
    });
    
    // 保存设置
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // 搜索功能
    document.getElementById('inventory-search').addEventListener('input', renderInventory);
    document.getElementById('inventory-category').addEventListener('change', renderInventory);
    
    // 上传Excel
    document.getElementById('upload-btn').addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls';
        input.onchange = handleExcelUpload;
        input.click();
    });
    
    // 打印功能
    document.getElementById('print-btn').addEventListener('click', function() {
        window.print();
    });
    
    // 新增供应商
    document.getElementById('add-supplier-btn').addEventListener('click', function() {
        openAddSupplierModal();
    });
    
    // 新增客户
    document.getElementById('add-customer-btn').addEventListener('click', function() {
        openAddCustomerModal();
    });
    
    // 客户搜索
    document.getElementById('customer-search').addEventListener('input', renderCustomers);
}

// 切换 section
function switchSection(sectionId) {
    // 移除所有 active 类
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('nav-active');
    });
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('section-active');
    });
    
    // 添加 active 类
    document.querySelector(`nav a[href="#${sectionId}"]`).classList.add('nav-active');
    document.getElementById(sectionId).classList.add('section-active');
    
    // 重新渲染对应内容
    if (sectionId === 'dashboard') renderDashboard();
    if (sectionId === 'inventory') renderInventory();
    if (sectionId === 'inbound') renderInbound();
    if (sectionId === 'outbound') renderOutbound();
    if (sectionId === 'suppliers') renderSuppliers();
    if (sectionId === 'customers') renderCustomers();
    if (sectionId === 'statistics') renderStatistics();
}

// 打开新增中药弹窗
function openAddMedicineModal() {
    modalTitle.textContent = '新增中药';
    modalForm.innerHTML = `
        <div class="form-group">
            <label>中药名称</label>
            <input type="text" name="name" required>
        </div>
        <div class="form-group">
            <label>拼音</label>
            <input type="text" name="pinyin" required>
        </div>
        <div class="form-group">
            <label>首字母</label>
            <input type="text" name="initial" maxlength="1" required>
        </div>
        <div class="form-group">
            <label>分类</label>
            <input type="text" name="category" required>
        </div>
        <div class="form-group">
            <label>初始库存</label>
            <input type="number" name="stock" min="0" value="0" required>
        </div>
        <div class="form-group">
            <label>单位</label>
            <input type="text" name="unit" value="${settings.defaultUnit}" required>
        </div>
        <div class="form-group">
            <label>单价</label>
            <input type="number" name="price" min="0" step="0.01" value="0" required>
        </div>
        <button type="submit">保存</button>
    `;
    
    modalForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const newMedicine = {
            id: Date.now(),
            name: formData.get('name'),
            pinyin: formData.get('pinyin'),
            initial: formData.get('initial').toUpperCase(),
            category: formData.get('category'),
            stock: parseInt(formData.get('stock')),
            unit: formData.get('unit'),
            price: parseFloat(formData.get('price'))
        };
        
        medicines.push(newMedicine);
        categories = [...new Set(medicines.map(m => m.category))];
        saveData();
        renderInventory();
        updateCategorySelect();
        closeModalFunc();
    };
    
    modal.style.display = 'block';
}

// 打开新增入库弹窗
function openAddInboundModal() {
    modalTitle.textContent = '新增入库';
    modalForm.innerHTML = `
        <div class="form-group">
            <label>入库日期</label>
            <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-group">
            <label>中药名称</label>
            <select name="medicineId" required>
                ${medicines.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>数量</label>
            <input type="number" name="quantity" min="1" required>
        </div>
        <div class="form-group">
            <label>单价</label>
            <input type="number" name="price" min="0" step="0.01" required>
        </div>
        <div class="form-group">
            <label>供应商</label>
            <select name="supplierId" required>
                ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
        </div>
        <button type="submit">保存</button>
    `;
    
    modalForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const medicineId = parseInt(formData.get('medicineId'));
        const quantity = parseInt(formData.get('quantity'));
        const price = parseFloat(formData.get('price'));
        const supplierId = parseInt(formData.get('supplierId'));
        
        // 更新库存
        const medicine = medicines.find(m => m.id === medicineId);
        const supplier = suppliers.find(s => s.id === supplierId);
        if (medicine && supplier) {
            medicine.stock += quantity;
            medicine.price = price; // 更新单价
            
            // 记录入库
            const newInbound = {
                id: Date.now(),
                date: formData.get('date'),
                medicineId: medicineId,
                medicineName: medicine.name,
                quantity: quantity,
                unit: medicine.unit,
                price: price,
                total: price * quantity,
                supplierId: supplierId,
                supplierName: supplier.name
            };
            
            inboundRecords.push(newInbound);
            saveData();
            renderInventory();
            renderInbound();
            renderDashboard();
            closeModalFunc();
        }
    };
    
    modal.style.display = 'block';
}

// 打开新增出库弹窗
function openAddOutboundModal() {
    modalTitle.textContent = '新增出库';
    modalForm.innerHTML = `
        <div class="form-group">
            <label>出库日期</label>
            <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-group">
            <label>中药名称</label>
            <select name="medicineId" required>
                ${medicines.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>数量</label>
            <input type="number" name="quantity" min="1" required>
        </div>
        <div class="form-group">
            <label>单价</label>
            <input type="number" name="price" min="0" step="0.01" required>
        </div>
        <div class="form-group">
            <label>客户</label>
            <select name="customerId" required>
                ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>用途</label>
            <input type="text" name="purpose" required>
        </div>
        <button type="submit">保存</button>
    `;
    
    modalForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const medicineId = parseInt(formData.get('medicineId'));
        const quantity = parseInt(formData.get('quantity'));
        const price = parseFloat(formData.get('price'));
        const customerId = parseInt(formData.get('customerId'));
        
        // 检查库存
        const medicine = medicines.find(m => m.id === medicineId);
        const customer = customers.find(c => c.id === customerId);
        if (medicine && customer && medicine.stock >= quantity) {
            medicine.stock -= quantity;
            
            // 记录出库
            const newOutbound = {
                id: Date.now(),
                date: formData.get('date'),
                medicineId: medicineId,
                medicineName: medicine.name,
                quantity: quantity,
                unit: medicine.unit,
                price: price,
                total: price * quantity,
                customerId: customerId,
                customerName: customer.name,
                purpose: formData.get('purpose')
            };
            
            outboundRecords.push(newOutbound);
            saveData();
            renderInventory();
            renderOutbound();
            renderDashboard();
            closeModalFunc();
        } else {
            alert('库存不足！');
        }
    };
    
    modal.style.display = 'block';
}

// 关闭弹窗
function closeModalFunc() {
    modal.style.display = 'none';
}

// 保存设置
function saveSettings() {
    settings.lowStockThreshold = parseInt(document.getElementById('low-stock-threshold').value);
    settings.defaultUnit = document.getElementById('default-unit').value;
    saveData();
    alert('设置已保存');
}

// 渲染首页
function renderDashboard() {
    // 计算统计数据
    const totalInventory = medicines.reduce((sum, m) => sum + m.stock, 0);
    const lowStockCount = medicines.filter(m => m.stock < settings.lowStockThreshold).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayInbound = inboundRecords.filter(r => r.date === today).reduce((sum, r) => sum + r.quantity, 0);
    const todayOutbound = outboundRecords.filter(r => r.date === today).reduce((sum, r) => sum + r.quantity, 0);
    
    // 更新卡片数据
    document.getElementById('total-inventory').textContent = totalInventory;
    document.getElementById('low-stock').textContent = lowStockCount;
    document.getElementById('today-inbound').textContent = todayInbound;
    document.getElementById('today-outbound').textContent = todayOutbound;
    
    // 渲染库存分布图表
    renderInventoryChart();
    
    // 渲染库存变动趋势图表
    renderTrendChart();
}

// 渲染库存管理
function renderInventory() {
    const searchTerm = document.getElementById('inventory-search').value.toLowerCase();
    const categoryFilter = document.getElementById('inventory-category').value;
    
    const filteredMedicines = medicines.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm) ||
                             m.pinyin.toLowerCase().includes(searchTerm) ||
                             m.initial.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || m.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = filteredMedicines.map((m, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${m.name}</td>
            <td>${m.pinyin}</td>
            <td>${m.initial}</td>
            <td>${m.category}</td>
            <td ${m.stock < settings.lowStockThreshold ? 'style="color: red; font-weight: bold;"' : ''}>
                ${m.stock}
            </td>
            <td>${m.unit}</td>
            <td>¥${m.price || 0}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editMedicine(${m.id})">编辑</button>
                <button class="action-btn delete-btn" onclick="deleteMedicine(${m.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 渲染入库记录
function renderInbound() {
    const tbody = document.querySelector('#inbound-table tbody');
    tbody.innerHTML = inboundRecords.reverse().map((r, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${r.date}</td>
            <td>${r.medicineName}</td>
            <td>${r.quantity}</td>
            <td>${r.unit}</td>
            <td>¥${r.price || 0}</td>
            <td>¥${r.total || 0}</td>
            <td>${r.supplierName || r.supplier}</td>
            <td>
                <button class="action-btn print-btn" onclick="printRecord('inbound', ${r.id})">打印</button>
            </td>
        </tr>
    `).join('');
}

// 渲染出库记录
function renderOutbound() {
    const tbody = document.querySelector('#outbound-table tbody');
    tbody.innerHTML = outboundRecords.reverse().map((r, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${r.date}</td>
            <td>${r.medicineName}</td>
            <td>${r.quantity}</td>
            <td>${r.unit}</td>
            <td>¥${r.price || 0}</td>
            <td>¥${r.total || 0}</td>
            <td>${r.customerName || ''}</td>
            <td>${r.purpose}</td>
            <td>
                <button class="action-btn print-btn" onclick="printRecord('outbound', ${r.id})">打印</button>
            </td>
        </tr>
    `).join('');
}

// 渲染统计分析
function renderStatistics() {
    renderCategoryChart();
    renderDistributionChart();
    render7DayTrendChart();
}

// 渲染库存分布图表
function renderInventoryChart() {
    const ctx = document.getElementById('inventory-chart').getContext('2d');
    
    // 按分类统计库存
    const categoryStock = {};
    medicines.forEach(m => {
        if (!categoryStock[m.category]) {
            categoryStock[m.category] = 0;
        }
        categoryStock[m.category] += m.stock;
    });
    
    const labels = Object.keys(categoryStock);
    const data = Object.values(categoryStock);
    
    if (window.inventoryChart) {
        window.inventoryChart.destroy();
    }
    
    window.inventoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '库存数量',
                data: data,
                backgroundColor: 'rgba(52, 152, 219, 0.6)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 渲染库存变动趋势图表
function renderTrendChart() {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    
    // 生成近7天日期
    const dates = [];
    const inboundData = [];
    const outboundData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        
        // 计算每天的入库量
        const dayInbound = inboundRecords.filter(r => r.date === dateStr).reduce((sum, r) => sum + r.quantity, 0);
        inboundData.push(dayInbound);
        
        // 计算每天的出库量
        const dayOutbound = outboundRecords.filter(r => r.date === dateStr).reduce((sum, r) => sum + r.quantity, 0);
        outboundData.push(dayOutbound);
    }
    
    if (window.trendChart) {
        window.trendChart.destroy();
    }
    
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '入库量',
                    data: inboundData,
                    borderColor: 'rgba(39, 174, 96, 1)',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.1
                },
                {
                    label: '出库量',
                    data: outboundData,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 渲染分类库存柱状图
function renderCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // 按分类统计库存
    const categoryStock = {};
    medicines.forEach(m => {
        if (!categoryStock[m.category]) {
            categoryStock[m.category] = 0;
        }
        categoryStock[m.category] += m.stock;
    });
    
    const labels = Object.keys(categoryStock);
    const data = Object.values(categoryStock);
    
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    window.categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '库存数量',
                data: data,
                backgroundColor: 'rgba(243, 156, 18, 0.6)',
                borderColor: 'rgba(243, 156, 18, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 渲染库存分布饼图
function renderDistributionChart() {
    const ctx = document.getElementById('distribution-chart').getContext('2d');
    
    // 按分类统计库存
    const categoryStock = {};
    medicines.forEach(m => {
        if (!categoryStock[m.category]) {
            categoryStock[m.category] = 0;
        }
        categoryStock[m.category] += m.stock;
    });
    
    const labels = Object.keys(categoryStock);
    const data = Object.values(categoryStock);
    
    if (window.distributionChart) {
        window.distributionChart.destroy();
    }
    
    window.distributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.6)',
                    'rgba(39, 174, 96, 0.6)',
                    'rgba(243, 156, 18, 0.6)',
                    'rgba(231, 76, 60, 0.6)',
                    'rgba(155, 89, 182, 0.6)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(39, 174, 96, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(231, 76, 60, 1)',
                    'rgba(155, 89, 182, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// 渲染近7天库存变动图表
function render7DayTrendChart() {
    const ctx = document.getElementById('7day-trend-chart').getContext('2d');
    
    // 生成近7天日期
    const dates = [];
    const inboundData = [];
    const outboundData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        
        // 计算每天的入库量
        const dayInbound = inboundRecords.filter(r => r.date === dateStr).reduce((sum, r) => sum + r.quantity, 0);
        inboundData.push(dayInbound);
        
        // 计算每天的出库量
        const dayOutbound = outboundRecords.filter(r => r.date === dateStr).reduce((sum, r) => sum + r.quantity, 0);
        outboundData.push(dayOutbound);
    }
    
    if (window.sevenDayChart) {
        window.sevenDayChart.destroy();
    }
    
    window.sevenDayChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '入库量',
                    data: inboundData,
                    borderColor: 'rgba(39, 174, 96, 1)',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.1
                },
                {
                    label: '出库量',
                    data: outboundData,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 更新分类选择器
function updateCategorySelect() {
    const select = document.getElementById('inventory-category');
    select.innerHTML = '<option value="">全部分类</option>' +
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

// 编辑中药
function editMedicine(id) {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) {
        modalTitle.textContent = '编辑中药';
        modalForm.innerHTML = `
            <div class="form-group">
                <label>中药名称</label>
                <input type="text" name="name" value="${medicine.name}" required>
            </div>
            <div class="form-group">
                <label>拼音</label>
                <input type="text" name="pinyin" value="${medicine.pinyin}" required>
            </div>
            <div class="form-group">
                <label>首字母</label>
                <input type="text" name="initial" value="${medicine.initial}" maxlength="1" required>
            </div>
            <div class="form-group">
                <label>分类</label>
                <input type="text" name="category" value="${medicine.category}" required>
            </div>
            <div class="form-group">
                <label>库存数量</label>
                <input type="number" name="stock" value="${medicine.stock}" min="0" required>
            </div>
            <div class="form-group">
                <label>单位</label>
                <input type="text" name="unit" value="${medicine.unit}" required>
            </div>
            <div class="form-group">
                <label>单价</label>
                <input type="number" name="price" value="${medicine.price || 0}" min="0" step="0.01" required>
            </div>
            <button type="submit">保存</button>
        `;
        
        modalForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(modalForm);
            
            medicine.name = formData.get('name');
            medicine.pinyin = formData.get('pinyin');
            medicine.initial = formData.get('initial').toUpperCase();
            medicine.category = formData.get('category');
            medicine.stock = parseInt(formData.get('stock'));
            medicine.unit = formData.get('unit');
            medicine.price = parseFloat(formData.get('price'));
            
            categories = [...new Set(medicines.map(m => m.category))];
            saveData();
            renderInventory();
            updateCategorySelect();
            closeModalFunc();
        };
        
        modal.style.display = 'block';
    }
}

// 删除中药
function deleteMedicine(id) {
    if (confirm('确定要删除这个中药吗？')) {
        medicines = medicines.filter(m => m.id !== id);
        categories = [...new Set(medicines.map(m => m.category))];
        saveData();
        renderInventory();
        updateCategorySelect();
    }
}

// 渲染供应商列表
function renderSuppliers() {
    const tbody = document.querySelector('#suppliers-table tbody');
    tbody.innerHTML = suppliers.map((s, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${s.name}</td>
            <td>${s.contact}</td>
            <td>${s.phone}</td>
            <td>${s.address}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editSupplier(${s.id})">编辑</button>
                <button class="action-btn delete-btn" onclick="deleteSupplier(${s.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 渲染客户列表
function renderCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm));
    
    const tbody = document.querySelector('#customers-table tbody');
    tbody.innerHTML = filteredCustomers.map((c, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><a href="#" onclick="openCustomerDetailModal(${c.id}); return false;" style="color: #d2691e; text-decoration: underline; cursor: pointer;">${c.name}</a></td>
            <td>${c.gender}</td>
            <td>${c.age}</td>
            <td>${c.phone}</td>
            <td>${c.address}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editCustomer(${c.id})">编辑</button>
                <button class="action-btn delete-btn" onclick="deleteCustomer(${c.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 打开新增供应商弹窗
function openAddSupplierModal() {
    modalTitle.textContent = '新增供应商';
    modalForm.innerHTML = `
        <div class="form-group">
            <label>供应商名称</label>
            <input type="text" name="name" required>
        </div>
        <div class="form-group">
            <label>联系人</label>
            <input type="text" name="contact" required>
        </div>
        <div class="form-group">
            <label>联系电话</label>
            <input type="text" name="phone" required>
        </div>
        <div class="form-group">
            <label>地址</label>
            <input type="text" name="address" required>
        </div>
        <button type="submit">保存</button>
    `;
    
    modalForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const newSupplier = {
            id: Date.now(),
            name: formData.get('name'),
            contact: formData.get('contact'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };
        
        suppliers.push(newSupplier);
        saveData();
        renderSuppliers();
        closeModalFunc();
    };
    
    modal.style.display = 'block';
}

// 打开新增客户弹窗
function openAddCustomerModal() {
    modalTitle.textContent = '新增客户';
    modalForm.innerHTML = `
        <div class="form-group">
            <label>客户姓名</label>
            <input type="text" name="name" required>
        </div>
        <div class="form-group">
            <label>性别</label>
            <select name="gender" required>
                <option value="男">男</option>
                <option value="女">女</option>
            </select>
        </div>
        <div class="form-group">
            <label>年龄</label>
            <input type="number" name="age" min="0" required>
        </div>
        <div class="form-group">
            <label>联系电话</label>
            <input type="text" name="phone" required>
        </div>
        <div class="form-group">
            <label>地址</label>
            <input type="text" name="address" required>
        </div>
        <button type="submit">保存</button>
    `;
    
    modalForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(modalForm);
        const newCustomer = {
            id: Date.now(),
            name: formData.get('name'),
            gender: formData.get('gender'),
            age: parseInt(formData.get('age')),
            phone: formData.get('phone'),
            address: formData.get('address'),
            medicalRecord: {
                clinicalPresentation: '',
                prescriptions: []
            }
        };
        
        customers.push(newCustomer);
        saveData();
        renderCustomers();
        closeModalFunc();
    };
    
    modal.style.display = 'block';
}

// 编辑供应商
function editSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
        modalTitle.textContent = '编辑供应商';
        modalForm.innerHTML = `
            <div class="form-group">
                <label>供应商名称</label>
                <input type="text" name="name" value="${supplier.name}" required>
            </div>
            <div class="form-group">
                <label>联系人</label>
                <input type="text" name="contact" value="${supplier.contact}" required>
            </div>
            <div class="form-group">
                <label>联系电话</label>
                <input type="text" name="phone" value="${supplier.phone}" required>
            </div>
            <div class="form-group">
                <label>地址</label>
                <input type="text" name="address" value="${supplier.address}" required>
            </div>
            <button type="submit">保存</button>
        `;
        
        modalForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(modalForm);
            
            supplier.name = formData.get('name');
            supplier.contact = formData.get('contact');
            supplier.phone = formData.get('phone');
            supplier.address = formData.get('address');
            
            saveData();
            renderSuppliers();
            closeModalFunc();
        };
        
        modal.style.display = 'block';
    }
}

// 删除供应商
function deleteSupplier(id) {
    if (confirm('确定要删除这个供应商吗？')) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveData();
        renderSuppliers();
    }
}

// 编辑客户
function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (customer) {
        modalTitle.textContent = '编辑客户';
        modalForm.innerHTML = `
            <div class="form-group">
                <label>客户姓名</label>
                <input type="text" name="name" value="${customer.name}" required>
            </div>
            <div class="form-group">
                <label>性别</label>
                <select name="gender" required>
                    <option value="男" ${customer.gender === '男' ? 'selected' : ''}>男</option>
                    <option value="女" ${customer.gender === '女' ? 'selected' : ''}>女</option>
                </select>
            </div>
            <div class="form-group">
                <label>年龄</label>
                <input type="number" name="age" value="${customer.age}" min="0" required>
            </div>
            <div class="form-group">
                <label>联系电话</label>
                <input type="text" name="phone" value="${customer.phone}" required>
            </div>
            <div class="form-group">
                <label>地址</label>
                <input type="text" name="address" value="${customer.address}" required>
            </div>
            <button type="submit">保存</button>
        `;
        
        modalForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(modalForm);
            
            customer.name = formData.get('name');
            customer.gender = formData.get('gender');
            customer.age = parseInt(formData.get('age'));
            customer.phone = formData.get('phone');
            customer.address = formData.get('address');
            
            saveData();
            renderCustomers();
            closeModalFunc();
        };
        
        modal.style.display = 'block';
    }
}

// 删除客户
function deleteCustomer(id) {
    if (confirm('确定要删除这个客户吗？')) {
        customers = customers.filter(c => c.id !== id);
        saveData();
        renderCustomers();
    }
}

// 打开客户详情弹窗
function openCustomerDetailModal(id) {
    const customer = customers.find(c => c.id === id);
    if (customer) {
        modalTitle.textContent = `${customer.name} - 客户详情`;
        modalForm.innerHTML = `
            <div class="form-group">
                <h3>基本信息</h3>
                <p><strong>姓名：</strong>${customer.name}</p>
                <p><strong>性别：</strong>${customer.gender}</p>
                <p><strong>年龄：</strong>${customer.age}</p>
                <p><strong>联系电话：</strong>${customer.phone}</p>
                <p><strong>地址：</strong>${customer.address}</p>
            </div>
            
            <div class="form-group">
                <h3>临床表现</h3>
                <textarea name="clinicalPresentation" rows="6" placeholder="请输入临床表现...">${customer.medicalRecord.clinicalPresentation || ''}</textarea>
            </div>
            
            <div class="form-group">
                <h3>处方管理</h3>
                <button type="button" id="add-prescription-btn" class="action-btn">新增处方</button>
                
                <div id="prescriptions-list" style="margin-top: 1rem;">
                    ${customer.medicalRecord.prescriptions.length > 0 ? 
                        customer.medicalRecord.prescriptions.map((prescription, index) => `
                            <div style="border: 1px solid #e0e0e0; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                                <h4>处方 ${index + 1} - ${prescription.date}</h4>
                                <p><strong>临床诊断：</strong>${prescription.diagnosis || ''}</p>
                                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                                    <thead>
                                        <tr>
                                            <th>药物名称</th>
                                            <th>数量</th>
                                            <th>单位</th>
                                            <th>单价</th>
                                            <th>总价</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${prescription.items.map(item => `
                                            <tr>
                                                <td>${item.medicineName}</td>
                                                <td>${item.quantity}</td>
                                                <td>${item.unit}</td>
                                                <td>¥${item.price}</td>
                                                <td>¥${item.total}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                <p><strong>总金额：</strong>¥${prescription.totalAmount}</p>
                                <button type="button" class="action-btn print-btn" onclick="printPrescription(${customer.id}, ${index})">打印处方</button>
                            </div>
                        `).join('') 
                        : '<p>暂无处方记录</p>'
                    }
                </div>
            </div>
            
            <button type="submit">保存临床表现</button>
        `;
        
        modalForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(modalForm);
            
            customer.medicalRecord.clinicalPresentation = formData.get('clinicalPresentation');
            
            saveData();
            alert('临床表现已保存');
        };
        
        // 新增处方按钮点击事件
        setTimeout(() => {
            const addPrescriptionBtn = document.getElementById('add-prescription-btn');
            if (addPrescriptionBtn) {
                addPrescriptionBtn.addEventListener('click', function() {
                    openAddPrescriptionModal(customer.id);
                });
            }
        }, 100);
        
        modal.style.display = 'block';
    }
}

// 打开新增处方弹窗
function openAddPrescriptionModal(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        modalTitle.textContent = '处方笺';
        modalForm.innerHTML = `
            <input type="hidden" name="customerId" value="${customerId}">
            <div class="form-group">
                <h3>患者信息</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label>姓名</label>
                        <input type="text" value="${customer.name}" disabled>
                    </div>
                    <div>
                        <label>性别</label>
                        <input type="text" value="${customer.gender}" disabled>
                    </div>
                    <div>
                        <label>年龄</label>
                        <input type="text" value="${customer.age}岁" disabled>
                    </div>
                    <div>
                        <label>住址</label>
                        <input type="text" value="${customer.address}" disabled>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>临床表现</label>
                <input type="text" name="diagnosis" placeholder="请输入临床表现" required>
            </div>
            
            <div class="form-group">
                <label>过敏史</label>
                <input type="text" name="allergy" placeholder="请输入过敏史，无则留空">
            </div>
            
            <div class="form-group">
                <label>处方日期</label>
                <input type="date" name="prescriptionDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            
            <div class="form-group">
                <label>添加药物</label>
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <input type="text" id="medicine-search" placeholder="输入药物名称或拼音检索" style="width: 100%; margin-bottom: 0.5rem;">
                        <select name="medicineId" id="medicine-select" required style="width: 100%;">
                            ${medicines.map(m => `<option value="${m.id}">${m.name} (库存: ${m.stock} ${m.unit})</option>`).join('')}
                        </select>
                    </div>
                    <input type="number" name="quantity" placeholder="数量" min="1" required style="flex: 0 0 100px;">
                    <input type="number" name="price" placeholder="单价" min="0" step="0.01" required style="flex: 0 0 100px;">
                    <button type="button" id="add-medicine-to-prescription" class="action-btn" style="flex: 0 0 80px;">添加</button>
                </div>
            </div>
            
            <div class="form-group">
                <h4>RP：处方药物明细</h4>
                <table id="prescription-items" style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr>
                            <th>药物名称</th>
                            <th>数量</th>
                            <th>单位</th>
                            <th>单价</th>
                            <th>总价</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <p><strong>总金额：</strong><span id="total-amount">¥0.00</span></p>
            </div>
            
            <div class="form-group">
                <label>用法/频次</label>
                <input type="text" name="usage" placeholder="例如：每日一剂 水煎服400ml 早晚分服">
            </div>
            
            <div class="form-group">
                <label>医师签名</label>
                <input type="text" name="doctorSignature" placeholder="请输入医师姓名">
            </div>
            
            <button type="submit">保存处方</button>
        `;
        
        // 处方药物列表
        const prescriptionItems = [];
        
        // 药物检索功能
        setTimeout(() => {
            const medicineSearch = document.getElementById('medicine-search');
            const medicineSelect = document.getElementById('medicine-select');
            
            medicineSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const options = medicineSelect.options;
                
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];
                    const medicine = medicines.find(m => m.id == option.value);
                    if (medicine) {
                        const matches = medicine.name.toLowerCase().includes(searchTerm) || 
                                       medicine.pinyin.toLowerCase().includes(searchTerm);
                        option.style.display = matches ? '' : 'none';
                    }
                }
            });
            
            // 添加药物到处方
            const addMedicineBtn = document.getElementById('add-medicine-to-prescription');
            if (addMedicineBtn) {
                addMedicineBtn.addEventListener('click', function() {
                    const medicineId = parseInt(document.querySelector('select[name="medicineId"]').value);
                    const quantity = parseInt(document.querySelector('input[name="quantity"]').value);
                    const price = parseFloat(document.querySelector('input[name="price"]').value);
                    
                    const medicine = medicines.find(m => m.id === medicineId);
                    if (medicine && quantity > 0 && price > 0) {
                        if (medicine.stock >= quantity) {
                            const total = quantity * price;
                            prescriptionItems.push({
                                medicineId: medicineId,
                                medicineName: medicine.name,
                                quantity: quantity,
                                unit: medicine.unit,
                                price: price,
                                total: total
                            });
                            
                            updatePrescriptionItems();
                        } else {
                            alert('库存不足！');
                        }
                    }
                });
            }
        }, 100);
        
        // 更新处方药物列表
        function updatePrescriptionItems() {
            const tbody = document.querySelector('#prescription-items tbody');
            tbody.innerHTML = prescriptionItems.map((item, index) => `
                <tr>
                    <td>${item.medicineName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>¥${item.price}</td>
                    <td>¥${item.total}</td>
                    <td><button type="button" onclick="removePrescriptionItem(${index})">删除</button></td>
                </tr>
            `).join('');
            
            // 计算总金额
            const totalAmount = prescriptionItems.reduce((sum, item) => sum + item.total, 0);
            document.getElementById('total-amount').textContent = `¥${totalAmount.toFixed(2)}`;
        }
        
        // 移除处方药物
        window.removePrescriptionItem = function(index) {
            prescriptionItems.splice(index, 1);
            updatePrescriptionItems();
        };
        
        modalForm.onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(modalForm);
            const prescriptionDate = formData.get('prescriptionDate');
            const diagnosis = formData.get('diagnosis');
            const allergy = formData.get('allergy');
            const usage = formData.get('usage');
            const doctorSignature = formData.get('doctorSignature');
            
            if (prescriptionItems.length > 0) {
                const totalAmount = prescriptionItems.reduce((sum, item) => sum + item.total, 0);
                
                // 创建新处方
                const newPrescription = {
                    id: Date.now(),
                    date: prescriptionDate,
                    diagnosis: diagnosis,
                    allergy: allergy,
                    items: prescriptionItems,
                    totalAmount: totalAmount,
                    usage: usage,
                    doctorSignature: doctorSignature
                };
                
                // 添加到处方列表
                customer.medicalRecord.prescriptions.push(newPrescription);
                
                // 扣减库存
                prescriptionItems.forEach(item => {
                    const medicine = medicines.find(m => m.id === item.medicineId);
                    if (medicine) {
                        medicine.stock -= item.quantity;
                    }
                });
                
                saveData();
                renderInventory();
                alert('处方已保存，库存已更新');
                closeModalFunc();
            } else {
                alert('请添加药物到处方');
            }
        };
        
        modal.style.display = 'block';
    }
}

// 打印处方
function printPrescription(customerId, prescriptionIndex) {
    const customer = customers.find(c => c.id === customerId);
    if (customer && customer.medicalRecord.prescriptions[prescriptionIndex]) {
        const prescription = customer.medicalRecord.prescriptions[prescriptionIndex];
        
        // 创建打印窗口
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>处方笺 - ${customer.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .prescription-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .prescription-header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .prescription-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 10px;
                        font-size: 14px;
                    }
                    .prescription-info div {
                        border: 1px solid #000;
                        padding: 5px;
                    }
                    .diagnosis {
                        border: 1px solid #000;
                        padding: 10px;
                        margin-bottom: 20px;
                        font-size: 14px;
                    }
                    .rp-section {
                        margin-bottom: 20px;
                    }
                    .rp-section h3 {
                        margin: 0 0 10px 0;
                        font-size: 16px;
                    }
                    .medicine-list {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    .medicine-item {
                        font-size: 14px;
                    }
                    .usage {
                        margin-bottom: 20px;
                        font-size: 14px;
                    }
                    .total-amount {
                        margin-bottom: 20px;
                        font-size: 14px;
                        text-align: right;
                    }
                    .signature {
                        margin-top: 40px;
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 10px;
                        font-size: 14px;
                    }
                    .signature div {
                        text-align: right;
                    }
                    .notes {
                        margin-top: 20px;
                        font-size: 12px;
                        border-top: 1px solid #000;
                        padding-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="prescription-header">
                    <h1>处方笺</h1>
                </div>
                <div style="font-size: 14px; margin-bottom: 20px;">
                    <div style="margin-bottom: 5px;"><strong>姓名：</strong>${customer.name}</div>
                    <div style="margin-bottom: 5px;"><strong>性别：</strong>${customer.gender}</div>
                    <div style="margin-bottom: 5px;"><strong>年龄：</strong>${customer.age}岁</div>
                    <div style="margin-bottom: 5px;"><strong>日期：</strong>${prescription.date}</div>
                    <div style="margin-bottom: 5px;"><strong>住址：</strong>${customer.address}</div>
                    <div style="margin-bottom: 5px;"><strong>过敏史：</strong>${prescription.allergy || '无'}</div>
                    <div style="margin-bottom: 5px;"><strong>临床表现：</strong>${prescription.diagnosis || ''}</div>
                </div>
                <div class="rp-section">
                    <h3>RP：</h3>
                    <div class="medicine-list">
                        ${prescription.items.map(item => `
                            <div class="medicine-item">${item.medicineName} ${item.quantity}${item.unit}</div>
                        `).join('')}
                    </div>
                </div>
                <div class="usage">
                    <strong>用法/频次：</strong>${prescription.usage || '每日一剂 水煎服400ml 早晚分服'}
                </div>
                <div class="total-amount">
                    <strong>共${prescription.items.length}味药物合计：¥${prescription.totalAmount}</strong>
                </div>
                <div class="signature">
                    <div>
                        <strong>医师签名：${prescription.doctorSignature || '______________'}</strong>
                    </div>
                </div>
                <div class="notes">
                    <p>注：1、处方原则上当日有效</p>
                    <p>2、取药请您当面核对药品名称、规格、数量</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// 打印记录
function printRecord(type, id) {
    let record;
    if (type === 'inbound') {
        record = inboundRecords.find(r => r.id === id);
    } else {
        record = outboundRecords.find(r => r.id === id);
    }
    
    if (record) {
        // 创建打印窗口
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>${type === 'inbound' ? '入库单' : '出库单'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .footer { margin-top: 40px; text-align: right; }
                </style>
            </head>
            <body>
                <h1>${type === 'inbound' ? '入库单' : '出库单'}</h1>
                <table>
                    <tr>
                        <th>日期</th>
                        <td>${record.date}</td>
                    </tr>
                    <tr>
                        <th>中药名称</th>
                        <td>${record.medicineName}</td>
                    </tr>
                    <tr>
                        <th>数量</th>
                        <td>${record.quantity} ${record.unit}</td>
                    </tr>
                    <tr>
                        <th>单价</th>
                        <td>¥${record.price || 0}</td>
                    </tr>
                    <tr>
                        <th>总价</th>
                        <td>¥${record.total || 0}</td>
                    </tr>
                    ${type === 'inbound' ? `
                    <tr>
                        <th>供应商</th>
                        <td>${record.supplierName || record.supplier}</td>
                    </tr>
                    ` : `
                    <tr>
                        <th>客户</th>
                        <td>${record.customerName || ''}</td>
                    </tr>
                    <tr>
                        <th>用途</th>
                        <td>${record.purpose}</td>
                    </tr>
                    `}
                </table>
                <div class="footer">
                    <p>操作员：系统</p>
                    <p>打印时间：${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// 处理Excel上传
function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // 处理导入的数据
            let importedCount = 0;
            let updatedCount = 0;
            
            jsonData.forEach(item => {
                const name = item['中药名称'] || item['名称'] || item['name'];
                const pinyin = item['拼音'] || item['pinyin'] || '';
                const initial = item['首字母'] || item['initial'] || (pinyin ? pinyin.charAt(0).toUpperCase() : '');
                const category = item['分类'] || item['category'] || '未分类';
                const stock = parseInt(item['库存'] || item['stock'] || 0);
                const unit = item['单位'] || item['unit'] || settings.defaultUnit;
                const strokes = item['笔画'] || item['strokes'] || '';
                
                if (name) {
                    // 检查是否已存在
                    const existingMedicine = medicines.find(m => m.name === name);
                    if (existingMedicine) {
                        // 更新现有记录
                        existingMedicine.pinyin = pinyin || existingMedicine.pinyin;
                        existingMedicine.initial = initial || existingMedicine.initial;
                        existingMedicine.category = category || existingMedicine.category;
                        existingMedicine.unit = unit || existingMedicine.unit;
                        updatedCount++;
                    } else {
                        // 添加新记录
                        const newMedicine = {
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            name: name,
                            pinyin: pinyin,
                            initial: initial,
                            category: category,
                            stock: stock,
                            unit: unit,
                            strokes: strokes
                        };
                        medicines.push(newMedicine);
                        importedCount++;
                    }
                }
            });
            
            categories = [...new Set(medicines.map(m => m.category))];
            saveData();
            renderInventory();
            updateCategorySelect();
            alert(`Excel数据导入完成！\n新增：${importedCount} 条\n更新：${updatedCount} 条`);
        };
        reader.readAsArrayBuffer(file);
    }
}

// 初始化系统
init();