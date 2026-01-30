// Application State
const state = {
    currentUser: null,
    currentRole: null,
    patients: [],
    consultations: [],
    analyses: [],
    prescriptions: [],
    transactions: [],
    medications: [],
    employees: [],
    attendance: [],
    stock: [],
    appointments: [],
    emergencyPatients: [],
    consultationTypes: [
        { id: 1, name: 'Consultation Générale', price: 500, active: true },
        { id: 2, name: 'Consultation Spéciale', price: 400, active: true },
        { id: 3, name: 'Consultation Pédiatrique', price: 300, active: true },
        { id: 4, name: 'Consultation Gynécologique', price: 600, active: true }
    ],
    labAnalyses: [
        { id: 1, name: 'Analyse de sang', price: 300, active: true },
        { id: 2, name: 'Analyse d\'urine', price: 200, active: true },
        { id: 3, name: 'Analyse de selles', price: 250, active: true },
        { id: 4, name: 'Échographie', price: 800, active: true },
        { id: 5, name: 'Radiographie', price: 500, active: true },
        { id: 6, name: 'ECG', price: 400, active: true },
        { id: 7, name: 'Sonographie', price: 700, active: true },
        { id: 8, name: 'IRM', price: 1500, active: true }
    ],
    externalServices: [
        { id: 1, name: 'Pansement', price: 150, active: true },
        { id: 2, name: 'Piqûre', price: 200, active: true },
        { id: 3, name: 'Planning familial', price: 300, active: true },
        { id: 4, name: 'Vaccination', price: 250, active: true },
        { id: 5, name: 'Soins infirmiers', price: 180, active: true },
        { id: 6, name: 'Prélèvement sanguin', price: 120, active: true }
    ],
    servicePrices: {
        'Consultation Urgence': 800,
        'Analyse Urgence': 500
    },
    paymentMethods: [
        { id: 'cash', name: 'Cash', icon: 'fas fa-money-bill-wave', needsDetails: true },
        { id: 'moncash', name: 'Mon Cash', icon: 'fas fa-mobile-alt', needsDetails: true, isMobile: true },
        { id: 'natcash', name: 'NatCash', icon: 'fas fa-phone-alt', needsDetails: true, isMobile: true },
        { id: 'debit', name: 'Carte Débit', icon: 'fas fa-credit-card', needsDetails: true },
        { id: 'credit', name: 'Carte Credit', icon: 'fas fa-credit-card', needsDetails: true },
        { id: 'mastercard', name: 'Master Card', icon: 'fab fa-cc-mastercard', needsDetails: true },
        { id: 'bank-transfer', name: 'Virement Bancaire', icon: 'fas fa-university', needsDetails: true }
    ],
    employeeCounter: 6,
    pediatricCounter: 1,
    externalServiceCounter: 1,
    labAnalysisCounter: 8,
    consultationTypeCounter: 4
};

// Variables globales pour la caisse
let currentPaymentTransaction = null;
let currentPaymentTotal = 0;
let selectedPaymentMethod = null;

// Fonction UNIFIÉE pour trouver un patient
function findPatient(patientId) {
    if (!patientId || patientId.trim() === '') {
        return null;
    }
    
    const searchId = patientId.trim().toUpperCase();
    
    // 1. Recherche exacte
    let patient = state.patients.find(p => p.id.toUpperCase() === searchId);
    if (patient) return patient;
    
    // 2. Si c'est un numéro seul (ex: "1", "2")
    if (/^\d+$/.test(searchId)) {
        // Essayer PA + numéro
        const paddedId = 'PA' + searchId.padStart(4, '0');
        patient = state.patients.find(p => p.id.toUpperCase() === paddedId);
        if (patient) return patient;
        
        // Essayer PED + numéro
        const pedId = 'PED' + searchId.padStart(4, '0');
        patient = state.patients.find(p => p.id.toUpperCase() === pedId);
        if (patient) return patient;
        
        // Essayer URG + numéro
        const urgId = 'URG' + searchId.padStart(4, '0');
        patient = state.patients.find(p => p.id.toUpperCase() === urgId);
        if (patient) return patient;
        
        // Essayer URG-PED + numéro
        const urgPedId = 'URG-PED' + searchId.padStart(4, '0');
        patient = state.patients.find(p => p.id.toUpperCase() === urgPedId);
        if (patient) return patient;
    }
    
    // 3. Si format court (ex: "PA1", "PED1", "URG1", "URG-PED1")
    if (searchId.match(/^(PA|PED|URG|URG-PED)\d+$/i)) {
        const letters = searchId.match(/^[A-Z-]+/)[0];
        const numbers = searchId.match(/\d+/)[0];
        const paddedId = letters + numbers.padStart(4, '0');
        
        patient = state.patients.find(p => p.id.toUpperCase() === paddedId);
        if (patient) return patient;
    }
    
    // 4. Recherche par nom ou téléphone (seulement pour les recherches non-numériques)
    if (!/^\d+$/.test(searchId) && searchId.length > 2) {
        patient = state.patients.find(p => 
            p.name.toUpperCase().includes(searchId) ||
            (p.phone && p.phone.includes(searchId))
        );
        
        if (patient) return patient;
    }
    
    return null;
}

// Fonction pour normaliser les IDs (enlever les espaces et mettre en majuscules)
function normalizeId(id) {
    return String(id).trim().toUpperCase().replace(/\s+/g, '');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    setupLogin();
    setupNavigation();
    setupPatients();
    setupConsultation();
    setupAppointments();
    setupLaboratory();
    setupPharmacy();
    setupCashier();
    setupAdministration();
    setupEmployees();
    setupEmergency();
    setupSettings();
    
    loadDemoData();
    updateDashboard();
    updateRoleBasedDashboard();
}

function setupLogin() {
    const roleButtons = document.querySelectorAll('.login-role-btn');
    const loginForm = document.getElementById('login-form');
    
    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            roleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.querySelector('.login-role-btn[data-role="admin"]').classList.add('active');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const selectedRole = document.querySelector('.login-role-btn.active').getAttribute('data-role');
        
        if (!username || !password) {
            alert('Veuillez entrer un nom d\'utilisateur et un mot de passe');
            return;
        }
        
        state.currentUser = username;
        state.currentRole = selectedRole;
        
        document.getElementById('current-username').textContent = username;
        document.getElementById('current-user-role').textContent = getRoleName(selectedRole);
        
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        showAlert('Connexion réussie! Bienvenue ' + username, 'success');
        
        updatePermissions();
        updateDashboard();
        updateRoleBasedDashboard();
    });
    
    document.getElementById('logout-btn').addEventListener('click', function() {
        state.currentUser = null;
        state.currentRole = null;
        
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
        
        document.getElementById('login-form').reset();
        document.querySelectorAll('.login-role-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.login-role-btn[data-role="admin"]').classList.add('active');
    });
}

function getRoleName(role) {
    const roles = {
        'admin': 'Administrateur',
        'doctor': 'Docteur',
        'lab': 'Technicien de Laboratoire',
        'pharmacy': 'Pharmacien',
        'reception': 'Réceptionniste',
        'cashier': 'Caissier'
    };
    return roles[role] || 'Utilisateur';
}

function updatePermissions() {
    const role = state.currentRole;
    
    // Masquer tous les tableaux de bord de rôle
    document.querySelectorAll('.role-dashboard').forEach(dashboard => {
        dashboard.classList.remove('active');
    });
    
    // Afficher le tableau de bord approprié
    if (role === 'admin') {
        document.getElementById('admin-dashboard').classList.add('active');
    } else if (role === 'doctor') {
        document.getElementById('doctor-dashboard').classList.add('active');
        updateDoctorDashboard();
    } else if (role === 'lab') {
        document.getElementById('lab-dashboard').classList.add('active');
        updateLabDashboard();
    } else if (role === 'pharmacy') {
        document.getElementById('pharmacy-dashboard').classList.add('active');
        updatePharmacyDashboard();
    } else if (role === 'reception') {
        document.getElementById('reception-dashboard').classList.add('active');
        updateReceptionDashboard();
    } else if (role === 'cashier') {
        document.getElementById('cashier-dashboard').classList.add('active');
        updateCashierDashboard();
    }
    
    // Gestion des permissions pharmacie
    const addMedicationBtn = document.getElementById('add-medication-btn');
    const stockPermissionLabel = document.getElementById('stock-permission-label');
    
    if (role === 'admin') {
        addMedicationBtn.classList.remove('hidden');
        stockPermissionLabel.textContent = 'Administration seulement';
    } else if (role === 'pharmacy') {
        addMedicationBtn.classList.add('hidden');
        stockPermissionLabel.textContent = 'Vue seulement';
    } else {
        addMedicationBtn.classList.add('hidden');
        stockPermissionLabel.textContent = 'Vue seulement';
    }
    
    // Gestion des employés (admin seulement)
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const employeeAdminSection = document.getElementById('employee-admin-section');
    const employeeManagementForm = document.getElementById('employee-management-form');
    
    if (role === 'admin') {
        addEmployeeBtn.classList.remove('hidden');
        employeeAdminSection.classList.remove('hidden');
    } else {
        addEmployeeBtn.classList.add('hidden');
        employeeAdminSection.classList.add('hidden');
        employeeManagementForm.classList.add('hidden');
    }
    
    // Services externes (caisse seulement)
    const externalServicesSection = document.getElementById('external-services-section');
    if (role === 'cashier' || role === 'admin') {
        externalServicesSection.classList.remove('hidden');
    } else {
        externalServicesSection.classList.add('hidden');
    }
    
    // Onglet Paramètres (admin seulement)
    const settingsTab = document.querySelector('[data-target="settings"]');
    if (role === 'admin') {
        settingsTab.style.display = 'flex';
    } else {
        settingsTab.style.display = 'none';
    }
    
    // Montrer tous les onglets pour admin
    if (role === 'admin') {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.style.display = 'flex';
        });
        return;
    }
    
    // Pour les autres rôles, afficher seulement les onglets pertinents
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });
    
    if (role === 'doctor') {
        document.querySelector('[data-target="dashboard"]').style.display = 'flex';
        document.querySelector('[data-target="patients"]').style.display = 'flex';
        document.querySelector('[data-target="consultation"]').style.display = 'flex';
        document.querySelector('[data-target="appointments"]').style.display = 'flex';
        document.querySelector('[data-target="emergency"]').style.display = 'flex';
    } else if (role === 'lab') {
        document.querySelector('[data-target="dashboard"]').style.display = 'flex';
        document.querySelector('[data-target="laboratory"]').style.display = 'flex';
        document.querySelector('[data-target="emergency"]').style.display = 'flex';
    } else if (role === 'pharmacy') {
        document.querySelector('[data-target="dashboard"]').style.display = 'flex';
        document.querySelector('[data-target="pharmacy"]').style.display = 'flex';
        document.querySelector('[data-target="emergency"]').style.display = 'flex';
    } else if (role === 'reception') {
        document.querySelector('[data-target="dashboard"]').style.display = 'flex';
        document.querySelector('[data-target="patients"]').style.display = 'flex';
        document.querySelector('[data-target="appointments"]').style.display = 'flex';
        document.querySelector('[data-target="emergency"]').style.display = 'flex';
    } else if (role === 'cashier') {
        document.querySelector('[data-target="dashboard"]').style.display = 'flex';
        document.querySelector('[data-target="cashier"]').style.display = 'flex';
        document.querySelector('[data-target="emergency"]').style.display = 'flex';
    }
    
    // Mettre à jour les totaux caissier si nécessaire
    if (role === 'cashier' || role === 'admin') {
        updateCashierTotals();
    }
}

function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            showContent(target);
            
            if (target === 'cashier') {
                updateCashierTotals();
            }
            
            if (target === 'appointments') {
                updateAppointmentsLists();
            }
            
            if (target === 'emergency') {
                updateEmergencyPatientsTable();
            }
            
            if (target === 'settings') {
                updateSettingsDisplay();
            }
            
            updateRoleBasedDashboard();
        });
    });
}

function showContent(contentId) {
    document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(contentId).classList.add('active');
}

function setupPatients() {
    const patientForm = document.getElementById('patient-form');
    const printCardBtn = document.getElementById('print-card-btn');
    const closeCardBtn = document.getElementById('close-card-btn');
    
    // Mettre à jour les valeurs affichées des signes vitaux
    document.getElementById('patient-temperature').addEventListener('input', function() {
        document.getElementById('vital-temperature-display').textContent = this.value || '--';
    });
    
    document.getElementById('patient-systolic').addEventListener('input', function() {
        const diastolic = document.getElementById('patient-diastolic').value;
        document.getElementById('vital-pressure-display').textContent = this.value + '/' + (diastolic || '--');
    });
    
    document.getElementById('patient-diastolic').addEventListener('input', function() {
        const systolic = document.getElementById('patient-systolic').value;
        document.getElementById('vital-pressure-display').textContent = (systolic || '--') + '/' + this.value;
    });
    
    document.getElementById('patient-pulse').addEventListener('input', function() {
        document.getElementById('vital-pulse-display').textContent = this.value || '--';
    });
    
    document.getElementById('patient-respiratory').addEventListener('input', function() {
        document.getElementById('vital-respiratory-display').textContent = this.value || '--';
    });
    
    document.getElementById('patient-oxygen').addEventListener('input', function() {
        document.getElementById('vital-oxygen-display').textContent = this.value ? this.value + '%' : '--%';
    });
    
    document.getElementById('patient-weight').addEventListener('input', function() {
        document.getElementById('vital-weight-display').textContent = this.value ? this.value + ' kg' : '-- kg';
    });
    
    document.getElementById('patient-height').addEventListener('input', function() {
        document.getElementById('vital-height-display').textContent = this.value ? this.value + ' cm' : '-- cm';
    });
    
    patientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const isPediatric = document.getElementById('patient-pediatric').checked;
        const isEmergency = document.getElementById('patient-emergency').checked;
        
        let patientPrefix;
        if (isEmergency) {
            patientPrefix = isPediatric ? 'URG-PED' : 'URG';
        } else {
            patientPrefix = isPediatric ? 'PED' : 'PA';
        }
        
        let patientId;
        if (isPediatric && !isEmergency) {
            patientId = 'PED' + (state.pediatricCounter++).toString().padStart(4, '0');
        } else {
            const patientCount = state.patients.filter(p => p.id.startsWith(patientPrefix)).length;
            patientId = patientPrefix + (patientCount + 1).toString().padStart(4, '0');
        }
        
        const patient = {
            id: patientId,
            name: document.getElementById('patient-name').value,
            dob: document.getElementById('patient-dob').value,
            birthplace: document.getElementById('patient-birthplace').value,
            phone: document.getElementById('patient-phone').value,
            address: document.getElementById('patient-address').value,
            responsible: document.getElementById('patient-responsible').value,
            registrationDate: new Date().toLocaleDateString('fr-FR'),
            registrationTime: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            pediatric: isPediatric,
            emergency: isEmergency,
            vitals: {
                temperature: document.getElementById('patient-temperature').value,
                systolic: document.getElementById('patient-systolic').value,
                diastolic: document.getElementById('patient-diastolic').value,
                pulse: document.getElementById('patient-pulse').value,
                respiratory: document.getElementById('patient-respiratory').value,
                oxygen: document.getElementById('patient-oxygen').value,
                weight: document.getElementById('patient-weight').value,
                height: document.getElementById('patient-height').value,
                notes: document.getElementById('patient-vitals-notes').value
            }
        };
        
        state.patients.push(patient);
        updatePatientsTable();
        displayPatientCard(patient);
        patientForm.reset();
        
        // Réinitialiser les affichages des signes vitaux
        document.querySelectorAll('.vital-value').forEach(el => {
            if (el.id.includes('display')) {
                el.textContent = '--';
                if (el.id === 'vital-oxygen-display') el.textContent = '--%';
                if (el.id === 'vital-weight-display') el.textContent = '-- kg';
                if (el.id === 'vital-height-display') el.textContent = '-- cm';
            }
        });
        
        showAlert('Patient enregistré avec succès! Numéro: ' + patientId, 'success');
        updateDashboard();
        updateRoleBasedDashboard();
    });
    
    printCardBtn.addEventListener('click', function() {
        const printContent = document.getElementById('print-area').innerHTML;
        printContentDirectly(printContent, 'Carte du Patient');
    });
    
    closeCardBtn.addEventListener('click', function() {
        document.getElementById('patient-card-preview').classList.add('hidden');
    });
}

function displayPatientCard(patient) {
    document.getElementById('card-patient-id').textContent = patient.id;
    document.getElementById('card-patient-name').textContent = patient.name;
    document.getElementById('card-patient-dob').textContent = new Date(patient.dob).toLocaleDateString('fr-FR');
    document.getElementById('card-patient-birthplace').textContent = patient.birthplace;
    document.getElementById('card-patient-responsible').textContent = patient.responsible || 'N/A';
    document.getElementById('card-patient-date').textContent = patient.registrationDate;
    
    const printArea = document.getElementById('print-area').innerHTML;
    document.getElementById('patient-card-display').innerHTML = printArea;
    
    document.getElementById('patient-card-preview').classList.remove('hidden');
}

function updatePatientsTable() {
    const tableBody = document.getElementById('patients-table-body');
    tableBody.innerHTML = '';
    
    state.patients.forEach(patient => {
        let typeText = '';
        if (patient.emergency) {
            typeText = '<span class="emergency-patient-tag">URGENCE</span>';
        } else if (patient.pediatric) {
            typeText = '<span class="pediatric-tag">PÉDIATRIE</span>';
        } else {
            typeText = 'Normal';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${new Date(patient.dob).toLocaleDateString('fr-FR')}</td>
            <td>${patient.phone || 'N/A'}</td>
            <td>${patient.registrationDate}</td>
            <td>${typeText}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewPatient('${patient.id}')">
                    <i class="fas fa-eye"></i> Voir
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function viewPatient(patientId) {
    const patient = findPatient(patientId);
    if (patient) {
        alert(`Patient trouvé:\nID: ${patient.id}\nNom: ${patient.name}\nDate de naissance: ${patient.dob}\nTéléphone: ${patient.phone || 'N/A'}\nDate d'enregistrement: ${patient.registrationDate}`);
    }
}

function setupConsultation() {
    const searchBtn = document.getElementById('search-patient-btn');
    const checkMedicationsBtn = document.getElementById('check-medications-btn');
    const addMedicationRowBtn = document.getElementById('add-medication-row-btn');
    const scheduleAppointmentBtn = document.getElementById('schedule-appointment-btn');
    const consultationForm = document.getElementById('consultation-form');
    
    // Ajouter une ligne au tableau des médicaments
    addMedicationRowBtn.addEventListener('click', function() {
        const tableBody = document.getElementById('medication-table-body');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="form-control medication-name" placeholder="Paracétamol 500mg"></td>
            <td><input type="text" class="form-control medication-dosage" placeholder="1 comprimé"></td>
            <td><input type="text" class="form-control medication-frequency" placeholder="3 fois par jour"></td>
            <td><input type="text" class="form-control medication-duration" placeholder="5 jours"></td>
            <td><button type="button" class="btn btn-danger remove-medication-btn"><i class="fas fa-trash"></i></button></td>
        `;
        tableBody.appendChild(newRow);
        
        // Ajouter l'événement pour supprimer la ligne
        newRow.querySelector('.remove-medication-btn').addEventListener('click', function() {
            newRow.remove();
        });
    });
    
    // Initialiser l'événement pour supprimer la première ligne
    document.querySelector('.remove-medication-btn').addEventListener('click', function() {
        this.closest('tr').remove();
    });
    
    searchBtn.addEventListener('click', function() {
        const patientId = document.getElementById('search-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient) {
            displayPatientForConsultation(patient);
            document.getElementById('consultation-form-container').classList.remove('hidden');
            
            // Charger les types de consultation
            loadConsultationTypes();
            
            // Charger les analyses de laboratoire
            loadLabAnalyses();
        } else {
            showAlert('Patient non trouvé. Vérifiez le numéro.', 'warning');
        }
    });
    
    checkMedicationsBtn.addEventListener('click', function() {
        const medications = getMedicationsFromTable();
        if (medications.length === 0) {
            showAlert('Veuillez ajouter au moins un médicament', 'warning');
            return;
        }
        
        checkMedicationsAvailability(medications);
    });
    
    scheduleAppointmentBtn.addEventListener('click', function() {
        const patientId = document.getElementById('search-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient) {
            document.getElementById('appointment-patient-id').value = patient.id;
            
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelector('[data-target="appointments"]').classList.add('active');
            showContent('appointments');
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('appointment-date').value = tomorrow.toISOString().split('T')[0];
        } else {
            showAlert('Veuillez d\'abord rechercher un patient', 'warning');
        }
    });
    
    consultationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const patientId = document.getElementById('search-patient-id').value;
        const consultationType = document.getElementById('selected-consultation-type').value;
        const consultationPrice = parseFloat(document.getElementById('selected-consultation-price').value) || 0;
        const diagnosis = document.getElementById('consultation-diagnosis').value;
        const notes = document.getElementById('consultation-notes').value;
        const otherAnalysis = document.getElementById('consultation-other-analysis').value;
        
        const patient = findPatient(patientId);
        if (!patient) {
            showAlert('Patient non trouvé', 'warning');
            return;
        }
        
        // Récupérer les analyses sélectionnées
        const selectedAnalyses = [];
        const selectedAnalysesPrices = [];
        
        document.querySelectorAll('.lab-analysis-checkbox input[type="checkbox"]:checked').forEach(cb => {
            const analysisId = cb.getAttribute('data-id');
            const analysis = state.labAnalyses.find(a => a.id == analysisId);
            if (analysis) {
                selectedAnalyses.push(analysis.name);
                selectedAnalysesPrices.push(analysis.price);
            }
        });
        
        if (otherAnalysis.trim() !== '') {
            selectedAnalyses.push(otherAnalysis);
            selectedAnalysesPrices.push(0);
        }
        
        const analyses = selectedAnalyses.join(', ');
        const totalAnalysisPrice = selectedAnalysesPrices.reduce((sum, price) => sum + price, 0);
        
        // Récupérer les médicaments du tableau
        const medications = getMedicationsFromTable();
        
        const isEmergency = patient.emergency;
        const consultationTypeName = consultationType || 'Consultation Générale';
        const consultationFee = isEmergency ? state.servicePrices['Consultation Urgence'] : consultationPrice;
        
        const consultation = {
            id: 'C-' + (state.consultations.length + 1).toString().padStart(3, '0'),
            patientId: patient.id,
            doctor: state.currentUser,
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            type: consultationTypeName,
            diagnosis: diagnosis,
            medications: medications,
            analyses: analyses,
            notes: notes,
            status: isEmergency ? 'pending' : 'pending-payment',
            emergency: isEmergency
        };
        
        state.consultations.push(consultation);
        
        // Transaction pour la consultation
        const consultationTransaction = {
            id: 'T-' + (state.transactions.length + 1).toString().padStart(3, '0'),
            patientId: patient.id,
            service: consultationTypeName + (isEmergency ? ' (Urgence)' : ''),
            amount: consultationFee,
            date: consultation.date,
            doctor: state.currentUser,
            status: isEmergency ? 'pending' : 'pending',
            emergency: isEmergency
        };
        state.transactions.push(consultationTransaction);
        
        // Transaction pour les analyses
        if (totalAnalysisPrice > 0) {
            const analysisTransaction = {
                id: 'T-' + (state.transactions.length + 1).toString().padStart(3, '0'),
                patientId: patient.id,
                service: 'Analyses de laboratoire',
                amount: totalAnalysisPrice,
                date: consultation.date,
                doctor: state.currentUser,
                status: isEmergency ? 'pending' : 'pending',
                emergency: isEmergency
            };
            state.transactions.push(analysisTransaction);
            
            // Enregistrer les analyses demandées
            const analysisRecord = {
                id: 'A-' + (state.analyses.length + 1).toString().padStart(3, '0'),
                patientId: patient.id,
                consultationId: consultation.id,
                analyses: analyses,
                price: totalAnalysisPrice,
                date: consultation.date,
                status: isEmergency ? 'pending' : 'pending-payment',
                results: '',
                emergency: isEmergency
            };
            state.analyses.push(analysisRecord);
        }
        
        // Ajouter les prescriptions
        medications.forEach(medication => {
            const prescriptionRecord = {
                id: 'R-' + (state.prescriptions.length + 1).toString().padStart(3, '0'),
                patientId: patient.id,
                consultationId: consultation.id,
                prescription: `${medication.name} - ${medication.dosage} ${medication.frequency} pendant ${medication.duration}`,
                date: consultation.date,
                status: isEmergency ? 'pending' : 'pending-payment',
                delivered: false,
                emergency: isEmergency
            };
            state.prescriptions.push(prescriptionRecord);
        });
        
        // Si c'est une urgence, ajouter au suivi des urgences
        if (isEmergency) {
            const existingEmergency = state.emergencyPatients.find(ep => ep.patientId === patient.id && ep.active);
            if (!existingEmergency) {
                const emergencyRecord = {
                    id: 'E-' + (state.emergencyPatients.length + 1).toString().padStart(3, '0'),
                    patientId: patient.id,
                    admissionTime: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                    admissionDate: new Date().toLocaleDateString('fr-FR'),
                    doctor: state.currentUser,
                    status: 'En traitement',
                    active: true,
                    notes: ''
                };
                state.emergencyPatients.push(emergencyRecord);
                updateEmergencyPatientsTable();
            }
        }
        
        consultationForm.reset();
        document.getElementById('consultation-form-container').classList.add('hidden');
        document.getElementById('consultation-patient-info').classList.add('hidden');
        document.getElementById('medication-check-results').innerHTML = '';
        document.getElementById('selected-consultation-type').value = '';
        document.getElementById('selected-consultation-price').value = '0';
        document.getElementById('consultation-price-display').textContent = '0 Gdes';
        
        // Réinitialiser le tableau des médicaments
        const tableBody = document.getElementById('medication-table-body');
        tableBody.innerHTML = `
            <tr>
                <td><input type="text" class="form-control medication-name" placeholder="Paracétamol 500mg"></td>
                <td><input type="text" class="form-control medication-dosage" placeholder="1 comprimé"></td>
                <td><input type="text" class="form-control medication-frequency" placeholder="3 fois par jour"></td>
                <td><input type="text" class="form-control medication-duration" placeholder="5 jours"></td>
                <td><button type="button" class="btn btn-danger remove-medication-btn"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
        
        // Réinitialiser les analyses
        document.getElementById('lab-analyses-selection').innerHTML = '';
        
        showAlert('Consultation enregistrée avec succès!', 'success');
        updateDashboard();
        updateRoleBasedDashboard();
        updateLaboratoryTable();
        updatePharmacyTable();
        updateTransactionsTable();
    });
}

function loadConsultationTypes() {
    const container = document.getElementById('consultation-type-selection');
    container.innerHTML = '';
    
    state.consultationTypes.forEach(type => {
        if (type.active) {
            const card = document.createElement('div');
            card.className = 'consultation-type-card';
            card.innerHTML = `
                <h4>${type.name}</h4>
                <div class="service-price">${type.price} Gdes</div>
                <p>Sélectionnez ce type de consultation</p>
            `;
            
            card.addEventListener('click', function() {
                document.querySelectorAll('.consultation-type-card').forEach(c => {
                    c.classList.remove('selected');
                });
                this.classList.add('selected');
                
                document.getElementById('selected-consultation-type').value = type.name;
                document.getElementById('selected-consultation-price').value = type.price;
                document.getElementById('consultation-price-display').textContent = type.price + ' Gdes';
            });
            
            container.appendChild(card);
        }
    });
}

function loadLabAnalyses() {
    const container = document.getElementById('lab-analyses-selection');
    container.innerHTML = '';
    
    state.labAnalyses.forEach(analysis => {
        if (analysis.active) {
            const div = document.createElement('div');
            div.className = 'lab-analysis-checkbox';
            div.innerHTML = `
                <input type="checkbox" id="lab-analysis-${analysis.id}" data-id="${analysis.id}">
                <label for="lab-analysis-${analysis.id}">${analysis.name}</label>
                <span class="lab-analysis-price">${analysis.price} Gdes</span>
            `;
            container.appendChild(div);
        }
    });
}

function getMedicationsFromTable() {
    const medications = [];
    const rows = document.querySelectorAll('#medication-table-body tr');
    
    rows.forEach(row => {
        const name = row.querySelector('.medication-name').value.trim();
        const dosage = row.querySelector('.medication-dosage').value.trim();
        const frequency = row.querySelector('.medication-frequency').value.trim();
        const duration = row.querySelector('.medication-duration').value.trim();
        
        if (name && dosage && frequency && duration) {
            medications.push({
                name: name,
                dosage: dosage,
                frequency: frequency,
                duration: duration
            });
        }
    });
    
    return medications;
}

function checkMedicationsAvailability(medications) {
    const resultsContainer = document.getElementById('medication-check-results');
    resultsContainer.innerHTML = '';
    
    if (medications.length === 0) {
        resultsContainer.innerHTML = '<div class="alert alert-info">Aucun médicament à vérifier.</div>';
        return;
    }
    
    let unavailableMeds = [];
    let availableMeds = [];
    
    medications.forEach(med => {
        const medName = med.name.toLowerCase();
        let found = false;
        let available = false;
        
        for (const stockItem of state.stock) {
            if (medName.includes(stockItem.medication.toLowerCase()) || 
                stockItem.medication.toLowerCase().includes(medName)) {
                found = true;
                if (stockItem.quantity > 0) {
                    availableMeds.push({
                        medication: med,
                        stock: stockItem.quantity,
                        price: stockItem.price
                    });
                    available = true;
                } else {
                    unavailableMeds.push({
                        medication: med,
                        reason: 'Stock épuisé'
                    });
                }
                break;
            }
        }
        
        if (!found) {
            unavailableMeds.push({
                medication: med,
                reason: 'Non disponible à l\'hôpital'
            });
        }
    });
    
    let html = '<div class="card"><h4>Vérification de disponibilité des médicaments</h4>';
    
    if (availableMeds.length > 0) {
        html += '<h5 class="medication-available">Médicaments disponibles:</h5><ul>';
        availableMeds.forEach(med => {
            html += `<li>${med.medication.name} - ${med.medication.dosage} ${med.medication.frequency} pendant ${med.medication.duration} <span class="text-success">(Stock: ${med.stock}, Prix: ${med.price} Gdes)</span></li>`;
        });
        html += '</ul>';
    }
    
    if (unavailableMeds.length > 0) {
        html += '<h5 class="medication-unavailable">Médicaments non disponibles:</h5><ul>';
        unavailableMeds.forEach(med => {
            html += `<li>${med.medication.name} - ${med.medication.dosage} ${med.medication.frequency} pendant ${med.medication.duration} <span class="text-danger">(${med.reason})</span></li>`;
        });
        html += '</ul>';
        
        html += `<button id="print-external-prescription-btn" class="btn btn-warning">
            <i class="fas fa-print"></i> Imprimer prescription pour pharmacie externe
        </button>`;
    }
    
    html += '</div>';
    resultsContainer.innerHTML = html;
    
    if (unavailableMeds.length > 0) {
        document.getElementById('print-external-prescription-btn').addEventListener('click', function() {
            const patientId = document.getElementById('search-patient-id').value;
            const patient = findPatient(patientId);
            
            if (patient) {
                printExternalPrescription(patient, unavailableMeds);
            }
        });
    }
}

function printExternalPrescription(patient, unavailableMeds) {
    let receiptHtml = `
        <div class="receipt">
            <div class="receipt-header">
                <h3>Hôpital Saint-Luc</h3>
                <p>Reçu d'achat de médicaments</p>
                <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
                <p><strong>Patient:</strong> ${patient.name}</p>
                <p><strong>Numéro:</strong> ${patient.id}</p>
                <p><strong>Docteur:</strong> ${state.currentUser}</p>
            </div>
            <h4>Médicaments à acheter:</h4>
    `;
    
    unavailableMeds.forEach(med => {
        const medText = `${med.medication.name} - ${med.medication.dosage} ${med.medication.frequency} pendant ${med.medication.duration}`;
        receiptHtml += `<div class="receipt-item"><span>${medText}</span><span>À acheter</span></div>`;
    });
    
    receiptHtml += `
            <div class="receipt-total">
                <span>Total estimé:</span>
                <span>À déterminer à la pharmacie</span>
            </div>
            <p class="text-center" style="margin-top: 15px; font-size: 0.9rem;">
                Présentez ce reçu à la pharmacie externe
            </p>
        </div>
    `;
    
    printContentDirectly(receiptHtml, 'Prescription Médicaments');
}

function displayPatientForConsultation(patient) {
    const detailsContainer = document.getElementById('consultation-patient-details');
    const emergencyTag = patient.emergency ? '<span class="emergency-patient-tag">URGENCE</span>' : '';
    const pediatricTag = patient.pediatric ? '<span class="pediatric-tag">PÉDIATRIE</span>' : '';
    
    let vitalsHtml = '';
    if (patient.vitals) {
        vitalsHtml = `
            <div class="card mt-3">
                <h4>Signes Vitaux</h4>
                <div class="vitals-grid">
                    ${patient.vitals.temperature ? `<div class="vital-item"><div class="vital-value">${patient.vitals.temperature}</div><div class="vital-label">Température (°C)</div></div>` : ''}
                    ${patient.vitals.systolic && patient.vitals.diastolic ? `<div class="vital-item"><div class="vital-value">${patient.vitals.systolic}/${patient.vitals.diastolic}</div><div class="vital-label">Pression artérielle</div></div>` : ''}
                    ${patient.vitals.pulse ? `<div class="vital-item"><div class="vital-value">${patient.vitals.pulse}</div><div class="vital-label">Pouls (bpm)</div></div>` : ''}
                    ${patient.vitals.respiratory ? `<div class="vital-item"><div class="vital-value">${patient.vitals.respiratory}</div><div class="vital-label">Respiration (/min)</div></div>` : ''}
                    ${patient.vitals.oxygen ? `<div class="vital-item"><div class="vital-value">${patient.vitals.oxygen}%</div><div class="vital-label">Saturation O2</div></div>` : ''}
                    ${patient.vitals.weight ? `<div class="vital-item"><div class="vital-value">${patient.vitals.weight} kg</div><div class="vital-label">Poids</div></div>` : ''}
                    ${patient.vitals.height ? `<div class="vital-item"><div class="vital-value">${patient.vitals.height} cm</div><div class="vital-label">Taille</div></div>` : ''}
                </div>
                ${patient.vitals.notes ? `<p><strong>Notes:</strong> ${patient.vitals.notes}</p>` : ''}
            </div>
        `;
    }
    
    detailsContainer.innerHTML = `
        <div class="patient-info-item">
            <div class="patient-info-label">Numéro patient:</div>
            <div>${patient.id} ${emergencyTag} ${pediatricTag}</div>
        </div>
        <div class="patient-info-item">
            <div class="patient-info-label">Nom:</div>
            <div>${patient.name}</div>
        </div>
        <div class="patient-info-item">
            <div class="patient-info-label">Date de naissance:</div>
            <div>${new Date(patient.dob).toLocaleDateString('fr-FR')}</div>
        </div>
        <div class="patient-info-item">
            <div class="patient-info-label">Téléphone:</div>
            <div>${patient.phone || 'N/A'}</div>
        </div>
        <div class="patient-info-item">
            <div class="patient-info-label">Date d'enregistrement:</div>
            <div>${patient.registrationDate}</div>
        </div>
        ${vitalsHtml}
    `;
    
    document.getElementById('consultation-patient-info').classList.remove('hidden');
}

function setupAppointments() {
    const appointmentForm = document.getElementById('appointment-form');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').min = today;
    
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const patientId = document.getElementById('appointment-patient-id').value;
        const patient = findPatient(patientId);
        
        if (!patient) {
            showAlert('Patient non trouvé. Vérifiez le numéro.', 'warning');
            return;
        }
        
        const doctor = document.getElementById('appointment-doctor').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const reason = document.getElementById('appointment-reason').value;
        
        const appointment = {
            id: 'RDV-' + (state.appointments.length + 1).toString().padStart(3, '0'),
            patientId: patient.id,
            patientName: patient.name,
            doctor: doctor,
            date: new Date(date).toLocaleDateString('fr-FR'),
            time: time,
            reason: reason,
            status: 'scheduled',
            createdBy: state.currentUser,
            createdAt: new Date().toLocaleString('fr-FR')
        };
        
        state.appointments.push(appointment);
        appointmentForm.reset();
        updateAppointmentsLists();
        updateDashboard();
        updateRoleBasedDashboard();
        showAlert('Rendez-vous planifié avec succès!', 'success');
    });
    
    updateAppointmentsLists();
}

function updateAppointmentsLists() {
    const upcomingList = document.getElementById('upcoming-appointments-list');
    const pastList = document.getElementById('past-appointments-list');
    
    upcomingList.innerHTML = '';
    pastList.innerHTML = '';
    
    const today = new Date();
    const todayStr = today.toLocaleDateString('fr-FR');
    
    const upcoming = state.appointments.filter(apt => {
        const aptDate = new Date(apt.date.split('/').reverse().join('-'));
        return aptDate >= today && apt.status === 'scheduled';
    });
    
    const past = state.appointments.filter(apt => {
        const aptDate = new Date(apt.date.split('/').reverse().join('-'));
        return aptDate < today || apt.status !== 'scheduled';
    });
    
    upcoming.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-') + ' ' + a.time);
        const dateB = new Date(b.date.split('/').reverse().join('-') + ' ' + b.time);
        return dateA - dateB;
    });
    
    past.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-') + ' ' + a.time);
        const dateB = new Date(b.date.split('/').reverse().join('-') + ' ' + b.time);
        return dateB - dateA;
    });
    
    if (upcoming.length === 0) {
        upcomingList.innerHTML = '<p class="text-center">Aucun rendez-vous à venir</p>';
    } else {
        upcoming.forEach(appointment => {
            const isToday = appointment.date === todayStr;
            const card = document.createElement('div');
            card.className = `appointment-card ${isToday ? 'urgent' : ''}`;
            card.innerHTML = `
                <div class="d-flex justify-between">
                    <div>
                        <h4>${appointment.patientName} <small>(${appointment.patientId})</small></h4>
                        <p><strong>Docteur:</strong> ${appointment.doctor}</p>
                        <p><strong>Raison:</strong> ${appointment.reason || 'Non spécifiée'}</p>
                    </div>
                    <div class="text-right">
                        <div class="appointment-time">${appointment.time}</div>
                        <div>${appointment.date}</div>
                        ${isToday ? '<div class="text-danger"><strong>Aujourd\'hui</strong></div>' : ''}
                    </div>
                </div>
                <div class="text-right mt-2">
                    <button class="btn btn-secondary" onclick="cancelAppointment('${appointment.id}')">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button class="btn" onclick="completeAppointment('${appointment.id}')">
                        <i class="fas fa-check"></i> Terminer
                    </button>
                </div>
            `;
            upcomingList.appendChild(card);
        });
    }
    
    if (past.length === 0) {
        pastList.innerHTML = '<p class="text-center">Aucun rendez-vous passé</p>';
    } else {
        past.forEach(appointment => {
            const card = document.createElement('div');
            card.className = 'appointment-card past';
            card.innerHTML = `
                <div class="d-flex justify-between">
                    <div>
                        <h4>${appointment.patientName} <small>(${appointment.patientId})</small></h4>
                        <p><strong>Docteur:</strong> ${appointment.doctor}</p>
                        <p><strong>Raison:</strong> ${appointment.reason || 'Non spécifiée'}</p>
                        <p><strong>Statut:</strong> ${appointment.status === 'completed' ? 'Terminé' : 'Annulé'}</p>
                    </div>
                    <div class="text-right">
                        <div class="appointment-time">${appointment.time}</div>
                        <div>${appointment.date}</div>
                    </div>
                </div>
            `;
            pastList.appendChild(card);
        });
    }
    
    updateDashboard();
    updateRoleBasedDashboard();
}

function updateDoctorAppointmentsDashboard() {
    const today = new Date().toLocaleDateString('fr-FR');
    const doctorAppointments = state.appointments.filter(apt => 
        apt.date === today && 
        apt.status === 'scheduled' &&
        (apt.doctor === state.currentUser || state.currentRole === 'admin')
    );
    
    const list = document.getElementById('today-appointments-list');
    list.innerHTML = '';
    
    if (doctorAppointments.length === 0) {
        list.innerHTML = '<p class="text-center">Aucun rendez-vous aujourd\'hui</p>';
    } else {
        doctorAppointments.forEach(appointment => {
            const card = document.createElement('div');
            card.className = 'appointment-card urgent';
            card.innerHTML = `
                <div class="d-flex justify-between">
                    <div>
                        <h4>${appointment.patientName}</h4>
                        <p><strong>Heure:</strong> ${appointment.time}</p>
                        <p><strong>Raison:</strong> ${appointment.reason || 'Non spécifiée'}</p>
                    </div>
                    <div class="text-right">
                        <button class="btn" onclick="startConsultationFromAppointment('${appointment.patientId}')">
                            <i class="fas fa-stethoscope"></i> Commencer
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    }
}

function startConsultationFromAppointment(patientId) {
    document.getElementById('search-patient-id').value = patientId;
    document.getElementById('search-patient-btn').click();
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('[data-target="consultation"]').classList.add('active');
    showContent('consultation');
}

function cancelAppointment(appointmentId) {
    const appointment = state.appointments.find(a => a.id === appointmentId);
    if (appointment) {
        appointment.status = 'cancelled';
        updateAppointmentsLists();
        updateDoctorAppointmentsDashboard();
        showAlert('Rendez-vous annulé', 'info');
    }
}

function completeAppointment(appointmentId) {
    const appointment = state.appointments.find(a => a.id === appointmentId);
    if (appointment) {
        appointment.status = 'completed';
        updateAppointmentsLists();
        updateDoctorAppointmentsDashboard();
        showAlert('Rendez-vous marqué comme terminé', 'success');
    }
}

function setupLaboratory() {
    const searchBtn = document.getElementById('lab-search-btn');
    
    searchBtn.addEventListener('click', function() {
        const patientId = document.getElementById('lab-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient) {
            displayLabResults(patient);
        } else {
            showAlert('Patient non trouvé. Vérifiez le numéro.', 'warning');
        }
    });
    
    updateLaboratoryTable();
}

function displayLabResults(patient) {
    const container = document.getElementById('lab-results-container');
    // Pour les urgences, montrer même si non payé
    const analyses = state.analyses.filter(a => a.patientId === patient.id && (a.status === 'paid' || patient.emergency || a.emergency));
    
    if (analyses.length === 0) {
        // Si aucune analyse, vérifier s'il y a des analyses en attente de paiement
        const pendingAnalyses = state.analyses.filter(a => a.patientId === patient.id && a.status === 'pending-payment');
        if (pendingAnalyses.length > 0 && !patient.emergency) {
            container.innerHTML = '<div class="alert alert-warning">Les analyses sont en attente de paiement. Veuillez payer à la caisse d\'abord.</div>';
        } else {
            container.innerHTML = '<div class="alert alert-info">Aucune analyse trouvée pour ce patient.</div>';
        }
    } else {
        let html = '<div class="card"><h3>Analyses du Patient</h3>';
        
        analyses.forEach(analysis => {
            const consultation = state.consultations.find(c => c.id === analysis.consultationId);
            const isEmergency = analysis.emergency || (patient && patient.emergency);
            const emergencyTag = isEmergency ? '<span class="emergency-patient-tag">URGENCE</span>' : '';
            
            html += `
                <div class="mb-3">
                    <h4>Analyse ${analysis.id} ${emergencyTag}</h4>
                    <p><strong>Demandé par:</strong> ${consultation ? consultation.doctor : 'N/A'}</p>
                    <p><strong>Date:</strong> ${analysis.date}</p>
                    <p><strong>Analyses demandées:</strong> ${analysis.analyses}</p>
                    <p><strong>Prix:</strong> ${analysis.price} Gdes</p>
                    <p><strong>Statut paiement:</strong> ${analysis.status === 'paid' ? 'Payé' : 'En attente'}</p>
                    
                    <div class="form-group">
                        <label class="form-label">Résultats</label>
                        <textarea class="form-control analysis-results" data-id="${analysis.id}" rows="3">${analysis.results}</textarea>
                    </div>
                    <button class="btn btn-success save-results-btn" data-id="${analysis.id}">
                        <i class="fas fa-save"></i> Enregistrer Résultats
                    </button>
                </div>
                <hr>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        document.querySelectorAll('.save-results-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const analysisId = this.getAttribute('data-id');
                const results = document.querySelector(`.analysis-results[data-id="${analysisId}"]`).value;
                
                const analysis = state.analyses.find(a => a.id === analysisId);
                if (analysis) {
                    analysis.results = results;
                    
                    showAlert('Résultats enregistrés avec succès!', 'success');
                }
            });
        });
    }
    
    container.classList.remove('hidden');
}

function updateLaboratoryTable() {
    const tableBody = document.getElementById('pending-analyses-body');
    tableBody.innerHTML = '';
    
    state.analyses.forEach(analysis => {
        if ((analysis.status === 'paid' || analysis.emergency) && !analysis.results) {
            const patient = findPatient(analysis.patientId);
            const consultation = state.consultations.find(c => c.id === analysis.consultationId);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${analysis.patientId}</td>
                <td>${patient ? patient.name : 'N/A'}</td>
                <td>${analysis.analyses}</td>
                <td>${analysis.price} Gdes</td>
                <td>${analysis.date}</td>
                <td><span class="${analysis.status === 'paid' ? 'text-success' : 'text-warning'}">${analysis.status === 'paid' ? 'Payé' : 'En attente'}</span></td>
                <td>
                    <button class="btn btn-success" onclick="enterLabResults('${analysis.id}')">
                        <i class="fas fa-edit"></i> Saisir Résultats
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function enterLabResults(analysisId) {
    const analysis = state.analyses.find(a => a.id === analysisId);
    if (analysis) {
        document.getElementById('lab-patient-id').value = analysis.patientId;
        document.getElementById('lab-search-btn').click();
    }
}

function setupPharmacy() {
    const searchBtn = document.getElementById('pharmacy-search-btn');
    const addMedicationBtn = document.getElementById('add-medication-btn');
    
    searchBtn.addEventListener('click', function() {
        const patientId = document.getElementById('pharmacy-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient) {
            displayPharmacyOrders(patient);
        } else {
            showAlert('Patient non trouvé. Vérifiez le numéro.', 'warning');
        }
    });
    
    addMedicationBtn.addEventListener('click', function() {
        if (state.currentRole !== 'admin') {
            showAlert('Seul l\'administrateur peut ajouter des médicaments', 'warning');
            return;
        }
        addMedicationToStock();
    });
    
    updatePharmacyTable();
    updateStockTable();
}

function displayPharmacyOrders(patient) {
    const container = document.getElementById('pharmacy-results-container');
    // Pour les urgences, montrer même si non payé
    const prescriptions = state.prescriptions.filter(p => p.patientId === patient.id && (p.status === 'paid' || patient.emergency || p.emergency));
    
    if (prescriptions.length === 0) {
        // Si aucune prescription payée, vérifier s'il y a des prescriptions en attente de paiement
        const pendingPrescriptions = state.prescriptions.filter(p => p.patientId === patient.id && p.status === 'pending-payment');
        if (pendingPrescriptions.length > 0 && !patient.emergency) {
            container.innerHTML = '<div class="alert alert-warning">Les prescriptions sont en attente de paiement. Veuillez payer à la caisse d\'abord.</div>';
        } else {
            container.innerHTML = '<div class="alert alert-info">Aucune ordonnance trouvée pour ce patient.</div>';
        }
    } else {
        let html = '<div class="card"><h3>Ordonnances du Patient</h3>';
        
        const consultations = {};
        prescriptions.forEach(p => {
            if (!consultations[p.consultationId]) {
                consultations[p.consultationId] = [];
            }
            consultations[p.consultationId].push(p);
        });
        
        for (const [consultId, meds] of Object.entries(consultations)) {
            const consultation = state.consultations.find(c => c.id === consultId);
            const isEmergency = meds[0].emergency || (patient && patient.emergency);
            const emergencyTag = isEmergency ? '<span class="emergency-patient-tag">URGENCE</span>' : '';
            
            html += `
                <div class="mb-3">
                    <h4>Ordonnance ${consultId} ${emergencyTag}</h4>
                    <p><strong>Prescrit par:</strong> ${consultation ? consultation.doctor : 'N/A'}</p>
                    <p><strong>Date:</strong> ${meds[0].date}</p>
                    <p><strong>Statut paiement:</strong> ${meds[0].status === 'paid' ? 'Payé' : 'En attente'}</p>
                    
                    <h5>Médicaments prescrits:</h5>
                    <ul>
            `;
            
            let allAvailable = true;
            let missingMeds = [];
            
            meds.forEach(prescription => {
                const medInStock = state.stock.find(m => 
                    prescription.prescription.toLowerCase().includes(m.medication.toLowerCase())
                );
                
                if (medInStock && medInStock.quantity > 0) {
                    html += `<li>${prescription.prescription} <span class="text-success">(En stock: ${medInStock.quantity}, Prix: ${medInStock.price} Gdes)</span></li>`;
                } else {
                    html += `<li>${prescription.prescription} <span class="text-danger">(Stock épuisé)</span></li>`;
                    allAvailable = false;
                    missingMeds.push(prescription.prescription);
                }
            });
            
            html += `</ul>`;
            
            if (!meds[0].delivered) {
                if (allAvailable) {
                    html += `
                        <button class="btn btn-success" onclick="dispenseMedication('${consultId}')">
                            <i class="fas fa-pills"></i> Délivrer tous les médicaments
                        </button>
                    `;
                } else {
                    html += `
                        <div class="alert alert-warning">
                            <p>Certains médicaments ne sont pas disponibles en stock.</p>
                            <button class="btn btn-warning" onclick="printMissingMedsReceipt('${patient.id}', ${JSON.stringify(missingMeds).replace(/'/g, "\\'")})">
                                <i class="fas fa-print"></i> Imprimer reçu d'achat
                            </button>
                            <button class="btn btn-success" onclick="dispensePartialMedication('${consultId}')">
                                <i class="fas fa-pills"></i> Délivrer seulement les disponibles
                            </button>
                        </div>
                    `;
                }
            } else if (meds[0].delivered) {
                html += '<div class="alert alert-success">Médicaments déjà délivrés</div>';
            }
            
            html += `<hr>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    container.classList.remove('hidden');
}

function dispenseMedication(consultationId) {
    const prescriptions = state.prescriptions.filter(p => p.consultationId === consultationId);
    const patient = findPatient(prescriptions[0].patientId);
    const isEmergency = patient && patient.emergency;
    
    prescriptions.forEach(prescription => {
        prescription.delivered = true;
        
        const medInStock = state.stock.find(m => 
            prescription.prescription.toLowerCase().includes(m.medication.toLowerCase())
        );
        
        if (medInStock) {
            medInStock.quantity -= 1;
            
            // Vérifier si une transaction existe déjà pour ce médicament
            let existingTransaction = state.transactions.find(t => 
                t.patientId === prescription.patientId && 
                t.service === 'Médicament: ' + medInStock.medication &&
                t.status === 'pending'
            );
            
            if (!existingTransaction) {
                const medTransaction = {
                    id: 'T-' + (state.transactions.length + 1).toString().padStart(3, '0'),
                    patientId: prescription.patientId,
                    service: 'Médicament: ' + medInStock.medication,
                    amount: medInStock.price,
                    date: new Date().toLocaleDateString('fr-FR'),
                    doctor: state.currentUser,
                    status: isEmergency ? 'pending' : 'pending',
                    emergency: isEmergency
                };
                state.transactions.push(medTransaction);
            }
        }
    });
    
    showAlert('Médicaments délivrés avec succès!', 'success');
    
    const patientId = prescriptions[0].patientId;
    document.getElementById('pharmacy-patient-id').value = patientId;
    document.getElementById('pharmacy-search-btn').click();
    
    updateStockTable();
    updateTransactionsTable();
    updateCashierTotals();
    updateRoleBasedDashboard();
}

function dispensePartialMedication(consultationId) {
    const prescriptions = state.prescriptions.filter(p => p.consultationId === consultationId);
    const patient = findPatient(prescriptions[0].patientId);
    const isEmergency = patient && patient.emergency;
    
    let deliveredCount = 0;
    
    prescriptions.forEach(prescription => {
        const medInStock = state.stock.find(m => 
            prescription.prescription.toLowerCase().includes(m.medication.toLowerCase())
        );
        
        if (medInStock && medInStock.quantity > 0) {
            prescription.delivered = true;
            medInStock.quantity -= 1;
            deliveredCount++;
            
            // Vérifier si une transaction existe déjà pour ce médicament
            let existingTransaction = state.transactions.find(t => 
                t.patientId === prescription.patientId && 
                t.service === 'Médicament: ' + medInStock.medication &&
                t.status === 'pending'
            );
            
            if (!existingTransaction) {
                const medTransaction = {
                    id: 'T-' + (state.transactions.length + 1).toString().padStart(3, '0'),
                    patientId: prescription.patientId,
                    service: 'Médicament: ' + medInStock.medication,
                    amount: medInStock.price,
                    date: new Date().toLocaleDateString('fr-FR'),
                    doctor: state.currentUser,
                    status: isEmergency ? 'pending' : 'pending',
                    emergency: isEmergency
                };
                state.transactions.push(medTransaction);
            }
        }
    });
    
    showAlert(`${deliveredCount} médicament(s) délivré(s) avec succès!`, 'success');
    
    const patientId = prescriptions[0].patientId;
    document.getElementById('pharmacy-patient-id').value = patientId;
    document.getElementById('pharmacy-search-btn').click();
    
    updateStockTable();
    updateTransactionsTable();
    updateCashierTotals();
    updateRoleBasedDashboard();
}

function printMissingMedsReceipt(patientId, missingMeds) {
    const patient = findPatient(patientId);
    
    let receiptHtml = `
        <div class="receipt">
            <div class="receipt-header">
                <h3>Hôpital Saint-Luc</h3>
                <p>Reçu d'achat de médicaments</p>
                <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
                <p><strong>Patient:</strong> ${patient.name}</p>
                <p><strong>Numéro:</strong> ${patient.id}</p>
            </div>
            <h4>Médicaments à acheter:</h4>
    `;
    
    missingMeds.forEach(med => {
        receiptHtml += `<div class="receipt-item"><span>${med}</span><span>À acheter</span></div>`;
    });
    
    receiptHtml += `
            <div class="receipt-total">
                <span>Total estimé:</span>
                <span>À déterminer à la pharmacie</span>
            </div>
            <p class="text-center" style="margin-top: 15px; font-size: 0.9rem;">
                Présentez ce reçu à la pharmacie externe
            </p>
        </div>
    `;
    
    printContentDirectly(receiptHtml, 'Médicaments à Acheter');
}

function updatePharmacyTable() {
    updateDashboard();
}

function addMedicationToStock() {
    state.employeeCounter++;
    const medCode = 'MED-' + state.employeeCounter.toString().padStart(3, '0');
    
    const medication = prompt("Nom du médicament:");
    if (!medication) return;
    
    const quantity = parseInt(prompt("Quantité en stock:", "100"));
    if (isNaN(quantity)) return;
    
    const threshold = parseInt(prompt("Seuil d'alerte:", "20"));
    if (isNaN(threshold)) return;
    
    const price = parseFloat(prompt("Prix unitaire (Gdes):", "50"));
    if (isNaN(price)) return;
    
    const stockItem = {
        id: medCode,
        medication: medication,
        quantity: quantity,
        threshold: threshold,
        price: price
    };
    
    state.stock.push(stockItem);
    updateStockTable();
    showAlert('Médicament ajouté au stock avec succès! Code: ' + medCode, 'success');
}

function updateStockTable() {
    const tableBody = document.getElementById('stock-table-body');
    tableBody.innerHTML = '';
    
    state.stock.forEach(item => {
        const lowStock = item.quantity <= item.threshold;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.medication}</td>
            <td class="${lowStock ? 'text-danger' : ''}">${item.quantity} ${lowStock ? '(Stock bas!)' : ''}</td>
            <td>${item.threshold}</td>
            <td>${item.price.toFixed(2)} Gdes</td>
            <td>
                ${state.currentRole === 'admin' ? 
                    `<button class="btn btn-secondary" onclick="restockMedication('${item.id}')">
                        <i class="fas fa-boxes"></i> Réapprovisionner
                    </button>` :
                    `<button class="btn btn-secondary" disabled>
                        <i class="fas fa-eye"></i> Voir seulement
                    </button>`
                }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function restockMedication(medicationId) {
    if (state.currentRole !== 'admin') {
        showAlert('Seul l\'administrateur peut réapprovisionner le stock', 'warning');
        return;
    }
    
    const item = state.stock.find(m => m.id === medicationId);
    if (item) {
        const amount = parseInt(prompt(`Quantité à ajouter pour ${item.medication}:`, "50"));
        if (!isNaN(amount) && amount > 0) {
            item.quantity += amount;
            updateStockTable();
            showAlert(`${amount} unités ajoutées au stock de ${item.medication}`, 'success');
        }
    }
}

function setupCashier() {
    const searchBtn = document.getElementById('cashier-search-btn');
    const printReceiptBtn = document.getElementById('print-receipt-btn');
    const paymentMethodSelect = document.getElementById('payment-method-select');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
    const addExternalServiceBtn = document.getElementById('add-external-service-btn');
    
    // Charger les services externes
    loadExternalServices();
    
    addExternalServiceBtn.addEventListener('click', function() {
        const patientId = document.getElementById('external-service-patient-id').value;
        const service = document.getElementById('selected-service').value;
        const price = document.getElementById('selected-service-price').value;
        
        if (!patientId) {
            showAlert('Veuillez entrer le numéro du patient', 'warning');
            return;
        }
        
        if (!service) {
            showAlert('Veuillez sélectionner un service', 'warning');
            return;
        }
        
        const patient = findPatient(patientId);
        if (!patient) {
            showAlert('Patient non trouvé. Vérifiez le numéro.', 'warning');
            return;
        }
        
        const transactionId = 'EXT-' + (state.externalServiceCounter++).toString().padStart(4, '0');
        const transaction = {
            id: transactionId,
            patientId: patient.id,
            service: 'Service Externe: ' + service,
            amount: parseFloat(price),
            date: new Date().toLocaleDateString('fr-FR'),
            doctor: state.currentUser,
            status: 'pending',
            emergency: false
        };
        
        state.transactions.push(transaction);
        showAlert('Service externe ajouté avec succès! Montant: ' + price + ' Gdes', 'success');
        
        // Réinitialiser
        document.getElementById('external-service-patient-id').value = '';
        document.getElementById('selected-service').value = '';
        document.getElementById('selected-service-price').value = '';
        document.querySelectorAll('.external-service-card').forEach(c => c.classList.remove('selected'));
        
        updateTransactionsTable();
        updateCashierTotals();
        updateRoleBasedDashboard();
    });
    
    searchBtn.addEventListener('click', function() {
        const patientId = document.getElementById('cashier-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient) {
            displayPatientTransactions(patient);
        } else {
            showAlert('Patient non trouvé. Vérifiez le numéro.', 'warning');
        }
    });
    
    printReceiptBtn.addEventListener('click', function() {
        const patientId = document.getElementById('cashier-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient) {
            printPaymentReceipt(patient);
        } else {
            showAlert('Veuillez d\'abord rechercher un patient', 'warning');
        }
    });
    
    paymentMethodSelect.addEventListener('change', function() {
        selectedPaymentMethod = this.value;
        
        // Cacher tous les détails de paiement
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.classList.add('hidden');
        });
        
        // Afficher les détails appropriés
        if (selectedPaymentMethod === 'cash') {
            document.getElementById('cash-payment-details').classList.remove('hidden');
            document.getElementById('cash-amount').value = '';
            document.getElementById('cash-amount').focus();
        } else if (selectedPaymentMethod === 'moncash' || selectedPaymentMethod === 'natcash') {
            document.getElementById('mobile-payment-details').classList.remove('hidden');
            document.getElementById('mobile-transaction-id').value = '';
            
            // Mettre à jour les liens de paiement
            const moncashLink = document.getElementById('moncash-link');
            const natcashLink = document.getElementById('natcash-link');
            
            if (currentPaymentTransaction && typeof currentPaymentTransaction === 'string' && !currentPaymentTransaction.startsWith('PA') && !currentPaymentTransaction.startsWith('URG')) {
                const transaction = state.transactions.find(t => t.id === currentPaymentTransaction);
                if (transaction) {
                    const amount = transaction.amount;
                    moncashLink.href = `https://moncash.com/pay?amount=${amount}&transaction=${currentPaymentTransaction}`;
                    natcashLink.href = `https://natcash.com/pay?amount=${amount}&transaction=${currentPaymentTransaction}`;
                }
            } else if (currentPaymentTransaction && (currentPaymentTransaction.startsWith('PA') || currentPaymentTransaction.startsWith('URG'))) {
                const patientTransactions = state.transactions.filter(t => t.patientId === currentPaymentTransaction && t.status === 'pending');
                const total = patientTransactions.reduce((sum, t) => sum + t.amount, 0);
                moncashLink.href = `https://moncash.com/pay?amount=${total}&patient=${currentPaymentTransaction}`;
                natcashLink.href = `https://natcash.com/pay?amount=${total}&patient=${currentPaymentTransaction}`;
            }
            
            document.getElementById('mobile-transaction-id').focus();
        } else if (selectedPaymentMethod === 'debit' || selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'mastercard') {
            document.getElementById('card-payment-details').classList.remove('hidden');
            document.getElementById('card-number').focus();
        } else if (selectedPaymentMethod === 'bank-transfer') {
            document.getElementById('bank-transfer-details').classList.remove('hidden');
            document.getElementById('transfer-reference').focus();
        }
        
        // Activer le bouton de confirmation
        confirmPaymentBtn.disabled = false;
    });
    
    // Gérer le montant cash pour calculer la monnaie
    document.getElementById('cash-amount')?.addEventListener('input', function() {
        if (currentPaymentTotal > 0) {
            const cashAmount = parseFloat(this.value) || 0;
            const change = cashAmount - currentPaymentTotal;
            document.getElementById('cash-change').textContent = 
                `Monnaie à rendre: ${change >= 0 ? change.toFixed(2) : '0.00'} Gdes`;
        }
    });
    
    confirmPaymentBtn.addEventListener('click', function() {
        if (!selectedPaymentMethod) {
            showAlert('Veuillez sélectionner un moyen de paiement', 'warning');
            return;
        }
        
        if (!currentPaymentTransaction) {
            showAlert('Aucune transaction sélectionnée', 'warning');
            return;
        }
        
        // Validation des détails de paiement
        let valid = true;
        let paymentDetails = {};
        
        if (selectedPaymentMethod === 'cash') {
            const cashAmount = parseFloat(document.getElementById('cash-amount').value);
            if (!cashAmount || cashAmount < currentPaymentTotal) {
                showAlert(`Le montant doit être au moins ${currentPaymentTotal.toFixed(2)} Gdes`, 'warning');
                valid = false;
            } else {
                paymentDetails.cashAmount = cashAmount;
                paymentDetails.change = cashAmount - currentPaymentTotal;
            }
        } else if (selectedPaymentMethod === 'moncash' || selectedPaymentMethod === 'natcash') {
            const transactionId = document.getElementById('mobile-transaction-id').value;
            if (!transactionId) {
                showAlert('Veuillez entrer l\'ID de transaction', 'warning');
                valid = false;
            } else {
                paymentDetails.transactionId = transactionId;
            }
        } else if (selectedPaymentMethod === 'debit' || selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'mastercard') {
            const cardNumber = document.getElementById('card-number').value;
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCVV = document.getElementById('card-cvv').value;
            const cardHolder = document.getElementById('card-holder').value;
            
            if (!cardNumber || !cardExpiry || !cardCVV || !cardHolder) {
                showAlert('Veuillez remplir tous les détails de la carte', 'warning');
                valid = false;
            } else {
                paymentDetails.cardLast4 = cardNumber.slice(-4);
            }
        } else if (selectedPaymentMethod === 'bank-transfer') {
            const transferRef = document.getElementById('transfer-reference').value;
            if (!transferRef) {
                showAlert('Veuillez entrer une référence de virement', 'warning');
                valid = false;
            } else {
                paymentDetails.transferReference = transferRef;
            }
        }
        
        if (!valid) return;
        
        markAsPaidWithMethod(currentPaymentTransaction, selectedPaymentMethod, paymentDetails);
        document.getElementById('payment-methods-container').classList.add('hidden');
        paymentMethodSelect.value = '';
        
        // Réinitialiser les formulaires de détails
        document.querySelectorAll('.payment-details input').forEach(input => {
            input.value = '';
        });
        
        selectedPaymentMethod = null;
        currentPaymentTransaction = null;
        currentPaymentTotal = 0;
        
        // Recharger la vue
        const patientId = document.getElementById('cashier-patient-id').value;
        if (patientId) {
            const patient = findPatient(patientId);
            if (patient) {
                displayPatientTransactions(patient);
            }
        }
    });
    
    cancelPaymentBtn.addEventListener('click', function() {
        document.getElementById('payment-methods-container').classList.add('hidden');
        paymentMethodSelect.value = '';
        selectedPaymentMethod = null;
        currentPaymentTransaction = null;
        currentPaymentTotal = 0;
        
        // Réinitialiser les formulaires de détails
        document.querySelectorAll('.payment-details input').forEach(input => {
            input.value = '';
        });
    });
    
    updateTransactionsTable();
    updateCashierTotals();
}

function loadExternalServices() {
    const container = document.getElementById('external-services-display');
    container.innerHTML = '';
    
    state.externalServices.forEach(service => {
        if (service.active) {
            const card = document.createElement('div');
            card.className = 'external-service-card';
            card.setAttribute('data-service', service.name);
            card.setAttribute('data-price', service.price);
            card.innerHTML = `
                <i class="fas fa-band-aid fa-2x mb-2" style="color: #1a6bca;"></i>
                <h4>${service.name}</h4>
                <p>${service.price} Gdes</p>
            `;
            
            card.addEventListener('click', function() {
                document.querySelectorAll('.external-service-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                
                document.getElementById('selected-service').value = service.name;
                document.getElementById('selected-service-price').value = service.price;
            });
            
            container.appendChild(card);
        }
    });
}

function updateCashierTotals() {
    const today = new Date().toLocaleDateString('fr-FR');
    const todayTransactions = state.transactions.filter(t => t.date === today && t.status === 'paid');
    
    const todayTotal = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('today-total').textContent = `Total aujourd'hui: ${todayTotal.toFixed(2)} Gdes`;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekTransactions = state.transactions.filter(t => {
        const transDate = new Date(t.date.split('/').reverse().join('-'));
        return transDate >= weekAgo && t.status === 'paid';
    });
    
    const weekTotal = weekTransactions.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('week-total').textContent = `Total cette semaine: ${weekTotal.toFixed(2)} Gdes`;
    
    // Mettre à jour le tableau de bord caisse
    document.getElementById('cashier-today-total').textContent = todayTotal.toFixed(2) + ' Gdes';
    document.getElementById('cashier-today-transactions').textContent = todayTransactions.length;
    document.getElementById('cashier-today-patients').textContent = new Set(todayTransactions.map(t => t.patientId)).size;
}

function displayPatientTransactions(patient) {
    const container = document.getElementById('cashier-results-container');
    const transactions = state.transactions.filter(t => t.patientId === patient.id);
    
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Aucune transaction trouvée pour ce patient.</div>';
        document.getElementById('print-receipt-btn').disabled = true;
    } else {
        let html = '<div class="card"><h3>Transactions du Patient</h3>';
        
        let totalPending = 0;
        let totalPaid = 0;
        let hasPending = false;
        
        // Regrouper les transactions par type
        const pendingTransactions = transactions.filter(t => t.status === 'pending');
        const paidTransactions = transactions.filter(t => t.status === 'paid');
        
        // Transactions en attente
        if (pendingTransactions.length > 0) {
            html += '<h4>Transactions en attente:</h4>';
            pendingTransactions.forEach(transaction => {
                hasPending = true;
                totalPending += transaction.amount;
                html += `
                    <div class="d-flex justify-between mb-2">
                        <div>
                            <strong>${transaction.service}</strong>
                            <div>${transaction.date} - ${transaction.id}</div>
                            ${transaction.emergency ? '<span class="emergency-patient-tag">URGENCE</span>' : ''}
                        </div>
                        <div>
                            <div class="text-right">${transaction.amount.toFixed(2)} Gdes</div>
                            <button class="btn btn-success" onclick="showPaymentMethods('${transaction.id}', ${transaction.amount})">
                                <i class="fas fa-credit-card"></i> Payer
                            </button>
                        </div>
                    </div>
                    <hr>
                `;
            });
        }
        
        // Transactions déjà payées
        if (paidTransactions.length > 0) {
            html += '<h4>Transactions payées:</h4>';
            paidTransactions.forEach(transaction => {
                totalPaid += transaction.amount;
                html += `
                    <div class="d-flex justify-between mb-2">
                        <div>
                            <strong>${transaction.service}</strong>
                            <div>${transaction.date} - ${transaction.id}</div>
                            ${transaction.emergency ? '<span class="emergency-patient-tag">URGENCE</span>' : ''}
                        </div>
                        <div>
                            <div class="text-right">${transaction.amount.toFixed(2)} Gdes</div>
                            <span class="text-success">Payé</span>
                        </div>
                    </div>
                    <hr>
                `;
            });
        }
        
        // Vérifier les analyses en attente de paiement
        const pendingAnalyses = state.analyses.filter(a => 
            a.patientId === patient.id && 
            (a.status === 'pending-payment' || a.status === 'pending') &&
            !state.transactions.some(t => 
                t.patientId === patient.id && 
                t.service === 'Analyses de laboratoire' &&
                t.status === 'pending'
            )
        );
        
        pendingAnalyses.forEach(analysis => {
            html += `
                <div class="d-flex justify-between mb-2">
                    <div>
                        <strong>Analyses de laboratoire</strong>
                        <div>${analysis.date} - Analyses demandées</div>
                        ${analysis.emergency ? '<span class="emergency-patient-tag">URGENCE</span>' : ''}
                    </div>
                    <div>
                        <div class="text-right">${analysis.price.toFixed(2)} Gdes</div>
                        <button class="btn btn-success" onclick="createAndPayAnalysis('${patient.id}', '${analysis.consultationId}', ${analysis.price}, ${analysis.emergency})">
                            <i class="fas fa-credit-card"></i> Payer
                        </button>
                    </div>
                </div>
                <hr>
            `;
            hasPending = true;
            totalPending += analysis.price;
        });
        
        html += `
            <div class="d-flex justify-between mt-3">
                <div><strong>Total en attente:</strong></div>
                <div><strong>${totalPending.toFixed(2)} Gdes</strong></div>
            </div>
            <div class="d-flex justify-between">
                <div><strong>Total déjà payé:</strong></div>
                <div><strong>${totalPaid.toFixed(2)} Gdes</strong></div>
            </div>
            <div class="d-flex justify-between mt-2">
                <div><strong>Total général:</strong></div>
                <div><strong>${(totalPending + totalPaid).toFixed(2)} Gdes</strong></div>
            </div>
            
            ${hasPending ? `
                <div class="text-center mt-3">
                    <button class="btn btn-success" onclick="showPaymentMethodsForAll('${patient.id}', ${totalPending})">
                        <i class="fas fa-check-circle"></i> Tout Payer (${totalPending.toFixed(2)} Gdes)
                    </button>
                </div>
            ` : ''}
        `;
        
        html += '</div>';
        container.innerHTML = html;
        
        document.getElementById('print-receipt-btn').disabled = totalPaid === 0;
    }
    
    container.classList.remove('hidden');
}

function createAndPayAnalysis(patientId, consultationId, amount, isEmergency) {
    const transactionId = 'T-' + (state.transactions.length + 1).toString().padStart(3, '0');
    
    const transaction = {
        id: transactionId,
        patientId: patientId,
        service: 'Analyses de laboratoire',
        amount: amount,
        date: new Date().toLocaleDateString('fr-FR'),
        doctor: state.currentUser,
        status: 'pending',
        emergency: isEmergency
    };
    
    state.transactions.push(transaction);
    
    // Mettre à jour le statut de l'analyse
    const analyses = state.analyses.filter(a => 
        a.patientId === patientId && 
        a.consultationId === consultationId
    );
    
    analyses.forEach(analysis => {
        analysis.status = 'pending-payment';
    });
    
    showPaymentMethods(transactionId, amount);
}

function showPaymentMethods(transactionId, amount) {
    const transaction = state.transactions.find(t => t.id === transactionId);
    if (transaction) {
        currentPaymentTransaction = transactionId;
        currentPaymentTotal = amount;
        
        // Réinitialiser le formulaire
        document.getElementById('payment-method-select').value = '';
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.classList.add('hidden');
        });
        
        document.getElementById('payment-methods-container').classList.remove('hidden');
        
        // Faire défiler vers la section de paiement
        setTimeout(() => {
            document.getElementById('payment-methods-container').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }
}

function showPaymentMethodsForAll(patientId, total) {
    currentPaymentTransaction = patientId;
    currentPaymentTotal = total;
    
    // Réinitialiser le formulaire
    document.getElementById('payment-method-select').value = '';
    document.querySelectorAll('.payment-details').forEach(detail => {
        detail.classList.add('hidden');
    });
    
    document.getElementById('payment-methods-container').classList.remove('hidden');
    
    // Faire défiler vers la section de paiement
    setTimeout(() => {
        document.getElementById('payment-methods-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

function markAsPaidWithMethod(transactionId, paymentMethod, paymentDetails = {}) {
    if (transactionId.startsWith('PA') || transactionId.startsWith('URG') || transactionId.startsWith('PED')) {
        // Paiement pour tous les services d'un patient
        markAllAsPaidWithMethod(transactionId, paymentMethod, paymentDetails);
    } else {
        // Paiement pour une transaction spécifique
        const transaction = state.transactions.find(t => t.id === transactionId);
        if (transaction) {
            transaction.status = 'paid';
            transaction.paymentMethod = paymentMethod;
            transaction.paymentDetails = paymentDetails;
            
            // Mettre à jour les statuts des services associés
            if (transaction.service.includes('Consultation')) {
                const consultations = state.consultations.filter(c => c.patientId === transaction.patientId && (c.status === 'pending-payment' || c.status === 'pending'));
                consultations.forEach(c => {
                    c.status = 'paid';
                    c.paymentMethod = paymentMethod;
                });
            }
            
            if (transaction.service.includes('Analyses')) {
                const analyses = state.analyses.filter(a => a.patientId === transaction.patientId && (a.status === 'pending-payment' || a.status === 'pending'));
                analyses.forEach(a => {
                    a.status = 'paid';
                    a.paymentMethod = paymentMethod;
                });
            }
            
            if (transaction.service.includes('Médicament')) {
                const prescriptions = state.prescriptions.filter(p => p.patientId === transaction.patientId && (p.status === 'pending-payment' || p.status === 'pending'));
                prescriptions.forEach(p => {
                    p.status = 'paid';
                    p.paymentMethod = paymentMethod;
                });
            }
            
            showAlert('Transaction payée avec ' + getPaymentMethodName(paymentMethod) + '!', 'success');
            
            const patientId = transaction.patientId;
            document.getElementById('cashier-patient-id').value = patientId;
            document.getElementById('cashier-search-btn').click();
            
            updateTransactionsTable();
            updateLaboratoryTable();
            updatePharmacyTable();
            updateCashierTotals();
            updateDashboard();
            updateRoleBasedDashboard();
            
            // Mettre à jour le statut d'urgence si le patient est en urgence et tout est payé
            const patient = findPatient(patientId);
            if (patient && patient.emergency) {
                const pendingTransactions = state.transactions.filter(t => t.patientId === patientId && t.status === 'pending');
                if (pendingTransactions.length === 0) {
                    // Fermer le dossier d'urgence
                    const emergencyRecord = state.emergencyPatients.find(ep => ep.patientId === patientId && ep.active);
                    if (emergencyRecord) {
                        emergencyRecord.active = false;
                        emergencyRecord.dischargeTime = new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
                        emergencyRecord.status = 'Payé et sorti';
                        updateEmergencyPatientsTable();
                    }
                }
            }
        }
    }
}

function markAllAsPaidWithMethod(patientId, paymentMethod, paymentDetails = {}) {
    // Marquer toutes les transactions en attente comme payées
    const pendingTransactions = state.transactions.filter(t => t.patientId === patientId && t.status === 'pending');
    
    pendingTransactions.forEach(transaction => {
        transaction.status = 'paid';
        transaction.paymentMethod = paymentMethod;
        transaction.paymentDetails = paymentDetails;
    });
    
    // Mettre à jour TOUS les statuts des services associés
    const consultations = state.consultations.filter(c => c.patientId === patientId && (c.status === 'pending-payment' || c.status === 'pending'));
    consultations.forEach(c => {
        c.status = 'paid';
        c.paymentMethod = paymentMethod;
    });
    
    const analyses = state.analyses.filter(a => a.patientId === patientId && (a.status === 'pending-payment' || a.status === 'pending'));
    analyses.forEach(a => {
        a.status = 'paid';
        a.paymentMethod = paymentMethod;
    });
    
    const prescriptions = state.prescriptions.filter(p => p.patientId === patientId && (p.status === 'pending-payment' || p.status === 'pending'));
    prescriptions.forEach(p => {
        p.status = 'paid';
        p.paymentMethod = paymentMethod;
    });
    
    showAlert('Toutes les transactions payées avec ' + getPaymentMethodName(paymentMethod) + '!', 'success');
    document.getElementById('cashier-patient-id').value = patientId;
    document.getElementById('cashier-search-btn').click();
    updateTransactionsTable();
    updateLaboratoryTable();
    updatePharmacyTable();
    updateCashierTotals();
    updateDashboard();
    updateRoleBasedDashboard();
    
    // Mettre à jour le statut d'urgence
    const patient = findPatient(patientId);
    if (patient && patient.emergency) {
        const emergencyRecord = state.emergencyPatients.find(ep => ep.patientId === patientId && ep.active);
        if (emergencyRecord) {
            emergencyRecord.active = false;
            emergencyRecord.dischargeTime = new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
            emergencyRecord.status = 'Payé et sorti';
            updateEmergencyPatientsTable();
        }
    }
}

function getPaymentMethodName(methodId) {
    const method = state.paymentMethods.find(m => m.id === methodId);
    return method ? method.name : 'Inconnu';
}

function printPaymentReceipt(patient) {
    const paidTransactions = state.transactions.filter(t => t.patientId === patient.id && t.status === 'paid');
    
    if (paidTransactions.length === 0) {
        showAlert('Aucune transaction payée pour ce patient', 'warning');
        return;
    }
    
    const receiptNumber = 'REC-' + Date.now().toString().slice(-6);
    
    let receiptHtml = `
        <div class="receipt">
            <div class="receipt-header">
                <h3>Hôpital Saint-Luc</h3>
                <p>Reçu de paiement</p>
                <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
                <p>Reçu #: ${receiptNumber}</p>
    `;
    
    const paymentMethod = paidTransactions[0].paymentMethod || 'Cash';
    receiptHtml += `<p>Moyen de paiement: ${getPaymentMethodName(paymentMethod)}</p>`;
    
    receiptHtml += `
            </div>
            <div>
                <p><strong>Patient:</strong> ${patient.name}</p>
                <p><strong>Numéro:</strong> ${patient.id}</p>
                ${patient.emergency ? '<p><strong>Type:</strong> Patient Urgence</p>' : ''}
                ${patient.pediatric ? '<p><strong>Type:</strong> Patient Pédiatrique</p>' : ''}
            </div>
            <h4>Services payés:</h4>
    `;
    
    let totalAmount = 0;
    
    paidTransactions.forEach(transaction => {
        receiptHtml += `
            <div class="receipt-item">
                <span>${transaction.service}</span>
                <span>${transaction.amount.toFixed(2)} Gdes</span>
            </div>
        `;
        totalAmount += transaction.amount;
    });
    
    receiptHtml += `
            <div class="receipt-total">
                <span>Total payé:</span>
                <span>${totalAmount.toFixed(2)} Gdes</span>
            </div>
            <p class="text-center" style="margin-top: 15px; font-size: 0.9rem;">
                Merci pour votre visite
            </p>
        </div>
    `;
    
    printContentDirectly(receiptHtml, 'Reçu de Paiement');
}

function updateTransactionsTable() {
    const tableBody = document.getElementById('transactions-table-body');
    tableBody.innerHTML = '';
    
    const recentTransactions = state.transactions.slice(-10).reverse();
    
    recentTransactions.forEach(transaction => {
        const patient = findPatient(transaction.patientId);
        const paymentMethod = transaction.paymentMethod ? getPaymentMethodName(transaction.paymentMethod) : 'Non spécifié';
        const emergencyTag = transaction.emergency ? '<span class="emergency-patient-tag">URGENCE</span>' : '';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.patientId} ${emergencyTag}</td>
            <td>${patient ? patient.name : 'N/A'}</td>
            <td>${transaction.service}</td>
            <td>${transaction.amount.toFixed(2)} Gdes</td>
            <td>${transaction.date}</td>
            <td>${paymentMethod}</td>
            <td><span class="${transaction.status === 'paid' ? 'text-success' : 'text-danger'}">${transaction.status === 'paid' ? 'Payé' : 'En attente'}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function setupAdministration() {
    updateAdminStats();
}

function updateAdminStats() {
    const totalRevenue = state.transactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('total-revenue').textContent = totalRevenue.toFixed(2) + ' Gdes';
    
    document.getElementById('total-patients').textContent = state.patients.length;
    document.getElementById('total-appointments').textContent = state.appointments.length;
    document.getElementById('total-analyses').textContent = state.analyses.length;
    
    updateServiceStats();
    updateEmployeeStats();
    updateDailyTransactions();
}

function updateServiceStats() {
    const tableBody = document.getElementById('service-stats-body');
    tableBody.innerHTML = '';
    
    const services = {};
    
    // Initialiser les services
    state.consultationTypes.forEach(type => {
        services[type.name] = { price: type.price, visits: 0, revenue: 0 };
    });
    
    services['Analyses de laboratoire'] = { price: 0, visits: 0, revenue: 0 };
    services['Médicaments'] = { price: 0, visits: 0, revenue: 0 };
    services['Services Externes'] = { price: 0, visits: 0, revenue: 0 };
    services['Rendez-vous'] = { price: 0, visits: 0, revenue: 0 };
    
    state.transactions.forEach(t => {
        if (t.status === 'paid') {
            let serviceName = t.service;
            
            // Identifier le type de service
            if (t.service.includes('Consultation')) {
                // Trouver le type de consultation correspondant
                const consultationType = state.consultationTypes.find(type => 
                    t.service.includes(type.name)
                );
                if (consultationType) {
                    serviceName = consultationType.name;
                }
            } else if (t.service.includes('Analyses')) {
                serviceName = 'Analyses de laboratoire';
            } else if (t.service.includes('Médicament')) {
                serviceName = 'Médicaments';
            } else if (t.service.includes('Service Externe')) {
                serviceName = 'Services Externes';
            }
            
            if (!services[serviceName]) {
                services[serviceName] = { price: 0, visits: 0, revenue: 0 };
            }
            
            services[serviceName].visits++;
            services[serviceName].revenue += t.amount;
        }
    });
    
    services['Rendez-vous'].visits = state.appointments.filter(a => a.status === 'completed').length;
    
    for (const [service, data] of Object.entries(services)) {
        if (data.visits > 0 || data.revenue > 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service}</td>
                <td>${data.price > 0 ? data.price.toFixed(2) + ' Gdes' : 'Variable'}</td>
                <td>${data.visits}</td>
                <td>${data.revenue.toFixed(2)} Gdes</td>
            `;
            tableBody.appendChild(row);
        }
    }
}

function updateEmployeeStats() {
    const tableBody = document.getElementById('employee-stats-body');
    tableBody.innerHTML = '';
    
    const today = new Date().toLocaleDateString('fr-FR');
    const employeeStats = {};
    
    state.transactions.forEach(t => {
        if (t.date === today && t.status === 'paid' && t.doctor) {
            if (!employeeStats[t.doctor]) {
                employeeStats[t.doctor] = {
                    name: t.doctor,
                    service: getEmployeeService(t.doctor),
                    patients: new Set(),
                    revenue: 0
                };
            }
            employeeStats[t.doctor].patients.add(t.patientId);
            employeeStats[t.doctor].revenue += t.amount;
        }
    });
    
    state.appointments.forEach(apt => {
        if (apt.date === today && apt.status === 'completed') {
            if (!employeeStats[apt.doctor]) {
                employeeStats[apt.doctor] = {
                    name: apt.doctor,
                    service: 'Consultation',
                    patients: new Set(),
                    revenue: 0
                };
            }
            employeeStats[apt.doctor].patients.add(apt.patientId);
        }
    });
    
    Object.values(employeeStats).forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.service}</td>
            <td>${emp.patients.size}</td>
            <td>${emp.revenue.toFixed(2)} Gdes</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDailyTransactions() {
    const tableBody = document.getElementById('daily-transactions-body');
    tableBody.innerHTML = '';
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('fr-FR'));
    }
    
    last7Days.forEach(day => {
        const dayTransactions = state.transactions.filter(t => t.date === day && t.status === 'paid');
        const dayAppointments = state.appointments.filter(a => a.date === day && a.status === 'completed');
        
        const consultations = dayTransactions.filter(t => t.service.includes('Consultation')).length;
        const analyses = dayTransactions.filter(t => t.service.includes('Analyses')).length;
        const externalServices = dayTransactions.filter(t => t.service.includes('Service Externe')).length;
        const medications = dayTransactions.filter(t => t.service.includes('Médicament')).length;
        const appointments = dayAppointments.length;
        const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day}</td>
            <td>${consultations}</td>
            <td>${analyses}</td>
            <td>${externalServices}</td>
            <td>${medications}</td>
            <td>${dayTotal.toFixed(2)} Gdes</td>
        `;
        tableBody.appendChild(row);
    });
}

function getEmployeeService(employeeName) {
    const services = {
        'Dr. Jean Martin': 'Consultation',
        'Dr. Marie Curie': 'Consultation',
        'Dr. Paul Durand': 'Consultation',
        'Technicien Labo': 'Laboratoire',
        'Pharmacien Paul': 'Pharmacie',
        'Réceptionniste Ana': 'Réception',
        'Caissier Marc': 'Caisse'
    };
    return services[employeeName] || 'Non spécifié';
}

function setupEmployees() {
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    const faceIdBtn = document.getElementById('face-id-btn');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const cancelEmployeeFormBtn = document.getElementById('cancel-employee-form-btn');
    const employeeForm = document.getElementById('employee-form');
    
    checkInBtn.addEventListener('click', function() {
        const employeeId = document.getElementById('employee-id').value;
        const pin = document.getElementById('employee-pin').value;
        
        if (!employeeId || !pin) {
            showAlert('Veuillez entrer l\'ID employé et le code PIN', 'warning');
            return;
        }
        
        const attendanceRecord = {
            employeeId: employeeId,
            checkIn: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            checkOut: '',
            date: new Date().toLocaleDateString('fr-FR')
        };
        
        state.attendance.push(attendanceRecord);
        updateAttendanceTable();
        showAlert('Pointage d\'entrée enregistré pour ' + employeeId, 'success');
        document.getElementById('employee-id').value = '';
        document.getElementById('employee-pin').value = '';
    });
    
    checkOutBtn.addEventListener('click', function() {
        const employeeId = document.getElementById('employee-id').value;
        const pin = document.getElementById('employee-pin').value;
        
        if (!employeeId || !pin) {
            showAlert('Veuillez entrer l\'ID employé et le code PIN', 'warning');
            return;
        }
        
        const today = new Date().toLocaleDateString('fr-FR');
        const record = state.attendance.find(a => 
            a.employeeId === employeeId && 
            a.date === today && 
            a.checkOut === ''
        );
        
        if (record) {
            record.checkOut = new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
            updateAttendanceTable();
            showAlert('Pointage de sortie enregistré pour ' + employeeId, 'success');
            document.getElementById('employee-id').value = '';
            document.getElementById('employee-pin').value = '';
        } else {
            showAlert('Aucun pointage d\'entrée trouvé pour cet employé aujourd\'hui', 'warning');
        }
    });
    
    faceIdBtn.addEventListener('click', function() {
        const demoEmployees = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006'];
        const randomEmployee = demoEmployees[Math.floor(Math.random() * demoEmployees.length)];
        
        document.getElementById('employee-id').value = randomEmployee;
        document.getElementById('employee-pin').value = '1234';
        showAlert('Face ID simulé. ID employé: ' + randomEmployee, 'info');
    });
    
    addEmployeeBtn.addEventListener('click', function() {
        document.getElementById('employee-form-title').textContent = 'Ajouter un Employé';
        document.getElementById('employee-edit-id').value = '';
        document.getElementById('employee-form').reset();
        
        // Générer un ID automatique
        state.employeeCounter++;
        const newEmployeeId = 'EMP' + state.employeeCounter.toString().padStart(3, '0');
        document.getElementById('employee-form-id').value = newEmployeeId;
        
        document.getElementById('employee-management-form').classList.remove('hidden');
    });
    
    cancelEmployeeFormBtn.addEventListener('click', function() {
        document.getElementById('employee-management-form').classList.add('hidden');
        employeeForm.reset();
    });
    
    employeeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const employeeId = document.getElementById('employee-form-id').value;
        const name = document.getElementById('employee-form-name').value;
        const role = document.getElementById('employee-form-role').value;
        const pin = document.getElementById('employee-form-pin').value;
        const email = document.getElementById('employee-form-email').value;
        const phone = document.getElementById('employee-form-phone').value;
        const access = document.getElementById('employee-form-access').value;
        const editId = document.getElementById('employee-edit-id').value;
        
        if (editId) {
            // Modifier un employé existant
            const employee = state.employees.find(e => e.id === editId);
            if (employee) {
                employee.id = employeeId;
                employee.name = name;
                employee.role = role;
                employee.pin = pin;
                employee.email = email;
                employee.phone = phone;
                employee.access = access;
                
                showAlert('Employé modifié avec succès!', 'success');
            }
        } else {
            // Ajouter un nouvel employé
            const employee = {
                id: employeeId,
                name: name,
                role: role,
                pin: pin,
                email: email,
                phone: phone,
                access: access
            };
            
            state.employees.push(employee);
            showAlert('Employé ajouté avec succès!', 'success');
        }
        
        document.getElementById('employee-management-form').classList.add('hidden');
        employeeForm.reset();
        updateEmployeesTable();
    });
    
    updateAttendanceTable();
    updateEmployeesTable();
}

function editEmployee(employeeId) {
    const employee = state.employees.find(e => e.id === employeeId);
    if (employee) {
        document.getElementById('employee-form-title').textContent = 'Modifier un Employé';
        document.getElementById('employee-edit-id').value = employee.id;
        document.getElementById('employee-form-id').value = employee.id;
        document.getElementById('employee-form-name').value = employee.name;
        document.getElementById('employee-form-role').value = employee.role;
        document.getElementById('employee-form-pin').value = employee.pin;
        document.getElementById('employee-form-email').value = employee.email;
        document.getElementById('employee-form-phone').value = employee.phone;
        document.getElementById('employee-form-access').value = employee.access;
        
        document.getElementById('employee-management-form').classList.remove('hidden');
    }
}

function deleteEmployee(employeeId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé?')) {
        state.employees = state.employees.filter(e => e.id !== employeeId);
        showAlert('Employé supprimé avec succès!', 'success');
        updateEmployeesTable();
    }
}

function updateAttendanceTable() {
    const tableBody = document.getElementById('presence-table-body');
    tableBody.innerHTML = '';
    
    const today = new Date().toLocaleDateString('fr-FR');
    const todayAttendance = state.attendance.filter(a => a.date === today);
    
    if (todayAttendance.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">Aucun pointage aujourd\'hui</td>';
        tableBody.appendChild(row);
    } else {
        todayAttendance.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.employeeId}</td>
                <td>${getEmployeeServiceById(record.employeeId)}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkOut || 'En cours...'}</td>
                <td><span class="${record.checkOut ? 'text-success' : 'text-warning'}">${record.checkOut ? 'Terminé' : 'En service'}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function getEmployeeServiceById(employeeId) {
    const services = {
        'EMP001': 'Consultation',
        'EMP002': 'Consultation',
        'EMP003': 'Laboratoire',
        'EMP004': 'Pharmacie',
        'EMP005': 'Réception',
        'EMP006': 'Caisse'
    };
    return services[employeeId] || 'Non spécifié';
}

function updateEmployeesTable() {
    const tableBody = document.getElementById('employees-table-body');
    tableBody.innerHTML = '';
    
    const employees = [
        { id: 'EMP001', name: 'Dr. Jean Martin', role: 'doctor', pin: '1234', email: 'jean.martin@hopital.fr', phone: '01 23 45 67 89', access: 'Consultation, Rendez-vous' },
        { id: 'EMP002', name: 'Dr. Marie Curie', role: 'doctor', pin: '1234', email: 'marie.curie@hopital.fr', phone: '01 23 45 67 90', access: 'Consultation, Rendez-vous' },
        { id: 'EMP003', name: 'Paul Labo', role: 'lab', pin: '1234', email: 'paul.labo@hopital.fr', phone: '01 23 45 67 91', access: 'Laboratoire' },
        { id: 'EMP004', name: 'Sophie Pharma', role: 'pharmacy', pin: '1234', email: 'sophie.pharma@hopital.fr', phone: '01 23 45 67 92', access: 'Pharmacie' },
        { id: 'EMP005', name: 'Ana Réception', role: 'reception', pin: '1234', email: 'ana.reception@hopital.fr', phone: '01 23 45 67 93', access: 'Réception, Patients, Rendez-vous' },
        { id: 'EMP006', name: 'Marc Caissier', role: 'cashier', pin: '1234', email: 'marc.caissier@hopital.fr', phone: '01 23 45 67 94', access: 'Caisse' }
    ];
    
    // Ajouter les employés de démo à state.employees s'ils n'existent pas déjà
    employees.forEach(demoEmp => {
        if (!state.employees.find(e => e.id === demoEmp.id)) {
            state.employees.push(demoEmp);
        }
    });
    
    state.employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${getRoleName(emp.role)}</td>
            <td>${emp.email}</td>
            <td>${emp.phone}</td>
            <td>${emp.access}</td>
            <td>
                <button class="btn btn-secondary" onclick="editEmployee('${emp.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn btn-danger" onclick="deleteEmployee('${emp.id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function setupEmergency() {
    const searchBtn = document.getElementById('emergency-search-btn');
    const consultationBtn = document.getElementById('emergency-consultation-btn');
    const labBtn = document.getElementById('emergency-lab-btn');
    const pharmacyBtn = document.getElementById('emergency-pharmacy-btn');
    const saveRecordBtn = document.getElementById('save-emergency-record-btn');
    const printBillBtn = document.getElementById('print-emergency-bill-btn');
    
    searchBtn.addEventListener('click', function() {
        const patientId = document.getElementById('emergency-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient && patient.emergency) {
            displayEmergencyPatient(patient);
        } else {
            showAlert('Patient d\'urgence non trouvé. Vérifiez le numéro (doit commencer par URG).', 'warning');
        }
    });
    
    consultationBtn.addEventListener('click', function() {
        const patientId = document.getElementById('emergency-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient && patient.emergency) {
            // Créer une consultation d'urgence
            const consultation = {
                id: 'C-' + (state.consultations.length + 1).toString().padStart(3, '0'),
                patientId: patient.id,
                doctor: state.currentUser,
                date: new Date().toLocaleDateString('fr-FR'),
                time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                type: 'Consultation Urgence',
                diagnosis: 'Consultation d\'urgence',
                prescription: '',
                analyses: '',
                notes: document.getElementById('emergency-notes').value,
                status: 'pending',
                emergency: true
            };
            
            state.consultations.push(consultation);
            
            const transaction = {
                id: 'T-' + (state.transactions.length + 1).toString().padStart(3, '0'),
                patientId: patient.id,
                service: 'Consultation Urgence',
                amount: state.servicePrices['Consultation Urgence'],
                date: consultation.date,
                doctor: state.currentUser,
                status: 'pending',
                emergency: true
            };
            state.transactions.push(transaction);
            
            updateEmergencyTransactions(patient.id);
            showAlert('Consultation d\'urgence ajoutée avec succès!', 'success');
        }
    });
    
    labBtn.addEventListener('click', function() {
        const patientId = document.getElementById('emergency-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient && patient.emergency) {
            // Créer une analyse d'urgence
            const analysisRecord = {
                id: 'A-' + (state.analyses.length + 1).toString().padStart(3, '0'),
                patientId: patient.id,
                consultationId: 'E-' + Date.now().toString().slice(-6),
                analyses: 'Analyses d\'urgence complètes',
                price: state.servicePrices['Analyse Urgence'],
                date: new Date().toLocaleDateString('fr-FR'),
                status: 'pending',
                results: '',
                emergency: true
            };
            state.analyses.push(analysisRecord);
            
            const transaction = {
                id: 'T-' + (state.transactions.length + 1).toString().padStart(3, '0'),
                patientId: patient.id,
                service: 'Analyses d\'urgence',
                amount: state.servicePrices['Analyse Urgence'],
                date: analysisRecord.date,
                doctor: state.currentUser,
                status: 'pending',
                emergency: true
            };
            state.transactions.push(transaction);
            
            updateEmergencyTransactions(patient.id);
            showAlert('Analyses d\'urgence ajoutées avec succès!', 'success');
        }
    });
    
    pharmacyBtn.addEventListener('click', function() {
        const patientId = document.getElementById('emergency-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient && patient.emergency) {
            // Créer une prescription d'urgence
            const meds = ['Paracétamol 1000mg', 'Anti-inflammatoire', 'Antibiotique large spectre'];
            
            meds.forEach(med => {
                const prescriptionRecord = {
                    id: 'R-' + (state.prescriptions.length + 1).toString().padStart(3, '0'),
                    patientId: patient.id,
                    consultationId: 'E-' + Date.now().toString().slice(-6),
                    prescription: med + ' - Posologie d\'urgence',
                    date: new Date().toLocaleDateString('fr-FR'),
                    status: 'pending',
                    delivered: false,
                    emergency: true
                };
                state.prescriptions.push(prescriptionRecord);
                
                // Trouver le médicament dans le stock
                const medInStock = state.stock.find(m => 
                    med.toLowerCase().includes(m.medication.toLowerCase())
                );
                
                if (medInStock) {
                    const transaction = {
                        id: 'T-' + (state.transactions.length + 1).toString().padStart(3, '0'),
                        patientId: patient.id,
                        service: 'Médicament: ' + medInStock.medication,
                        amount: medInStock.price,
                        date: new Date().toLocaleDateString('fr-FR'),
                        doctor: state.currentUser,
                        status: 'pending',
                        emergency: true
                    };
                    state.transactions.push(transaction);
                }
            });
            
            updateEmergencyTransactions(patient.id);
            showAlert('Médicaments d\'urgence ajoutés avec succès!', 'success');
        }
    });
    
    saveRecordBtn.addEventListener('click', function() {
        const patientId = document.getElementById('emergency-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient && patient.emergency) {
            const notes = document.getElementById('emergency-notes').value;
            
            // Mettre à jour les notes d'urgence
            const emergencyRecord = state.emergencyPatients.find(ep => ep.patientId === patientId && ep.active);
            if (emergencyRecord) {
                emergencyRecord.notes = notes;
                emergencyRecord.status = 'Traitement terminé - En attente de paiement';
            }
            
            showAlert('Dossier d\'urgence enregistré avec succès!', 'success');
            updateEmergencyPatientsTable();
        }
    });
    
    printBillBtn.addEventListener('click', function() {
        const patientId = document.getElementById('emergency-patient-id').value;
        const patient = findPatient(patientId);
        
        if (patient && patient.emergency) {
            printEmergencyBill(patient);
        }
    });
    
    updateEmergencyPatientsTable();
}

function displayEmergencyPatient(patient) {
    const detailsContainer = document.getElementById('emergency-patient-details');
    const emergencyRecord = state.emergencyPatients.find(ep => ep.patientId === patient.id && ep.active);
    
    detailsContainer.innerHTML = `
        <div class="patient-info-item">
            <div class="patient-info-label">Numéro patient:</div>
            <div>${patient.id} <span class="emergency-patient-tag">URGENCE</span> ${patient.pediatric ? '<span class="pediatric-tag">PÉDIATRIE</span>' : ''}</div>
        </div>
        <div class="patient-info-item">
            <div class="patient-info-label">Nom:</div>
            <div>${patient.name}</div>
        </div>
        <div class="patient-info-item">
            <div class="patient-info-label">Date de naissance:</div>
            <div>${new Date(patient.dob).toLocaleDateString('fr-FR')}</div>
        </div>
        <div class="patient-info-item">
            <div class="patient-info-label">Téléphone:</div>
            <div>${patient.phone || 'N/A'}</div>
        </div>
        ${emergencyRecord ? `
            <div class="patient-info-item">
                <div class="patient-info-label">Heure d'admission:</div>
                <div>${emergencyRecord.admissionTime}</div>
            </div>
            <div class="patient-info-item">
                <div class="patient-info-label">Statut:</div>
                <div>${emergencyRecord.status}</div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('emergency-patient-info').classList.remove('hidden');
    document.getElementById('emergency-services-container').classList.remove('hidden');
    
    updateEmergencyTransactions(patient.id);
}

function updateEmergencyTransactions(patientId) {
    const container = document.getElementById('emergency-transactions-list');
    const transactions = state.transactions.filter(t => t.patientId === patientId);
    
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-center">Aucune transaction pour ce patient d\'urgence</p>';
        return;
    }
    
    let total = 0;
    
    transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'd-flex justify-between mb-2';
        item.innerHTML = `
            <div>
                <strong>${transaction.service}</strong>
                <div>${transaction.date} - ${transaction.status === 'paid' ? '<span class="text-success">Payé</span>' : '<span class="text-warning">En attente</span>'}</div>
            </div>
            <div class="text-right">
                ${transaction.amount.toFixed(2)} Gdes
            </div>
        `;
        container.appendChild(item);
        total += transaction.amount;
    });
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'd-flex justify-between mt-3 pt-3 border-top';
    totalDiv.innerHTML = `
        <div><strong>Total dû:</strong></div>
        <div><strong>${total.toFixed(2)} Gdes</strong></div>
    `;
    container.appendChild(totalDiv);
}

function updateEmergencyPatientsTable() {
    const tableBody = document.getElementById('emergency-patients-body');
    tableBody.innerHTML = '';
    
    const activeEmergencies = state.emergencyPatients.filter(ep => ep.active);
    
    if (activeEmergencies.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">Aucun patient en urgence actif</td>';
        tableBody.appendChild(row);
    } else {
        activeEmergencies.forEach(emergency => {
            const patient = findPatient(emergency.patientId);
            const transactions = state.transactions.filter(t => t.patientId === emergency.patientId && t.status === 'pending');
            const totalDue = transactions.reduce((sum, t) => sum + t.amount, 0);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${emergency.patientId}</td>
                <td>${patient ? patient.name : 'N/A'}</td>
                <td>${emergency.admissionTime}</td>
                <td>${emergency.status}</td>
                <td>${totalDue.toFixed(2)} Gdes</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewEmergencyPatient('${emergency.patientId}')">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                    <button class="btn btn-success" onclick="processEmergencyPayment('${emergency.patientId}')">
                        <i class="fas fa-credit-card"></i> Payer
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function viewEmergencyPatient(patientId) {
    document.getElementById('emergency-patient-id').value = patientId;
    document.getElementById('emergency-search-btn').click();
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('[data-target="emergency"]').classList.add('active');
    showContent('emergency');
}

function processEmergencyPayment(patientId) {
    document.getElementById('cashier-patient-id').value = patientId;
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('[data-target="cashier"]').classList.add('active');
    showContent('cashier');
    
    // Déclencher la recherche automatique
    setTimeout(() => {
        document.getElementById('cashier-search-btn').click();
    }, 100);
}

function printEmergencyBill(patient) {
    const transactions = state.transactions.filter(t => t.patientId === patient.id);
    const totalDue = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    const totalPaid = transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
    
    let billHtml = `
        <div class="receipt">
            <div class="receipt-header">
                <h3>Hôpital Saint-Luc</h3>
                <p>FACTURE D'URGENCE</p>
                <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
                <p>Facture #: URG-${Date.now().toString().slice(-6)}</p>
            </div>
            <div>
                <p><strong>Patient:</strong> ${patient.name}</p>
                <p><strong>Numéro:</strong> ${patient.id}</p>
                <p><strong>Type:</strong> PATIENT URGENCE ${patient.pediatric ? '(PÉDIATRIE)' : ''}</p>
                <p><strong>Date d'admission:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <h4>Services d'urgence:</h4>
    `;
    
    transactions.forEach(transaction => {
        billHtml += `
            <div class="receipt-item">
                <span>${transaction.service}</span>
                <span>${transaction.amount.toFixed(2)} Gdes</span>
                <span>${transaction.status === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}</span>
            </div>
        `;
    });
    
    billHtml += `
            <div class="receipt-total">
                <span>Total dû:</span>
                <span>${totalDue.toFixed(2)} Gdes</span>
            </div>
            <div class="receipt-item">
                <span>Total payé:</span>
                <span>${totalPaid.toFixed(2)} Gdes</span>
            </div>
            <div class="receipt-total" style="border-top: 2px solid #dc3545;">
                <span>SOLDE À PAYER:</span>
                <span style="color: #dc3545;">${totalDue.toFixed(2)} Gdes</span>
            </div>
            <p class="text-center" style="margin-top: 15px; font-size: 0.9rem; color: #dc3545;">
                PRIORITÉ URGENCE - À RÉGLER AVANT LA SORTIE
            </p>
        </div>
    `;
    
    printContentDirectly(billHtml, 'Facture Urgence');
}

function setupSettings() {
    // Boutons d'ajout
    const addConsultationTypeBtn = document.getElementById('add-consultation-type-btn');
    const addExternalServiceBtn = document.getElementById('add-external-service-settings-btn');
    const addLabAnalysisBtn = document.getElementById('add-lab-analysis-settings-btn');
    const saveEmergencyPricesBtn = document.getElementById('save-emergency-prices-btn');
    const saveGeneralSettingsBtn = document.getElementById('save-general-settings-btn');
    
    addConsultationTypeBtn.addEventListener('click', function() {
        const name = document.getElementById('new-consultation-type').value;
        const price = parseFloat(document.getElementById('new-consultation-price').value);
        
        if (!name || isNaN(price) || price <= 0) {
            showAlert('Veuillez entrer un nom et un prix valides', 'warning');
            return;
        }
        
        state.consultationTypeCounter++;
        const newType = {
            id: state.consultationTypeCounter,
            name: name,
            price: price,
            active: true
        };
        
        state.consultationTypes.push(newType);
        
        document.getElementById('new-consultation-type').value = '';
        document.getElementById('new-consultation-price').value = '';
        
        updateSettingsDisplay();
        showAlert('Type de consultation ajouté avec succès!', 'success');
    });
    
    addExternalServiceBtn.addEventListener('click', function() {
        const name = document.getElementById('new-external-service').value;
        const price = parseFloat(document.getElementById('new-external-service-price').value);
        
        if (!name || isNaN(price) || price <= 0) {
            showAlert('Veuillez entrer un nom et un prix valides', 'warning');
            return;
        }
        
        state.externalServiceCounter++;
        const newService = {
            id: state.externalServiceCounter,
            name: name,
            price: price,
            active: true
        };
        
        state.externalServices.push(newService);
        
        document.getElementById('new-external-service').value = '';
        document.getElementById('new-external-service-price').value = '';
        
        updateSettingsDisplay();
        loadExternalServices();
        showAlert('Service externe ajouté avec succès!', 'success');
    });
    
    addLabAnalysisBtn.addEventListener('click', function() {
        const name = document.getElementById('new-lab-analysis').value;
        const price = parseFloat(document.getElementById('new-lab-analysis-price').value);
        
        if (!name || isNaN(price) || price <= 0) {
            showAlert('Veuillez entrer un nom et un prix valides', 'warning');
            return;
        }
        
        state.labAnalysisCounter++;
        const newAnalysis = {
            id: state.labAnalysisCounter,
            name: name,
            price: price,
            active: true
        };
        
        state.labAnalyses.push(newAnalysis);
        
        document.getElementById('new-lab-analysis').value = '';
        document.getElementById('new-lab-analysis-price').value = '';
        
        updateSettingsDisplay();
        showAlert('Analyse de laboratoire ajoutée avec succès!', 'success');
    });
    
    saveEmergencyPricesBtn.addEventListener('click', function() {
        const consultationPrice = parseFloat(document.getElementById('emergency-consultation-price').value);
        const analysisPrice = parseFloat(document.getElementById('emergency-analysis-price').value);
        
        if (isNaN(consultationPrice) || consultationPrice <= 0 || isNaN(analysisPrice) || analysisPrice <= 0) {
            showAlert('Veuillez entrer des prix valides pour les services d\'urgence', 'warning');
            return;
        }
        
        state.servicePrices['Consultation Urgence'] = consultationPrice;
        state.servicePrices['Analyse Urgence'] = analysisPrice;
        
        showAlert('Prix des services d\'urgence mis à jour avec succès!', 'success');
    });
    
    saveGeneralSettingsBtn.addEventListener('click', function() {
        const hospitalName = document.getElementById('hospital-name').value;
        const address = document.getElementById('hospital-address').value;
        const phone = document.getElementById('hospital-phone').value;
        
        if (!hospitalName || !address || !phone) {
            showAlert('Veuillez remplir tous les champs de configuration', 'warning');
            return;
        }
        
        showAlert('Configuration générale enregistrée avec succès!', 'success');
    });
    
    // Initialiser les valeurs des prix d'urgence
    document.getElementById('emergency-consultation-price').value = state.servicePrices['Consultation Urgence'];
    document.getElementById('emergency-analysis-price').value = state.servicePrices['Analyse Urgence'];
    
    updateSettingsDisplay();
}

function updateSettingsDisplay() {
    // Types de consultation
    const consultationList = document.getElementById('consultation-types-list');
    consultationList.innerHTML = '';
    
    state.consultationTypes.forEach(type => {
        const item = document.createElement('div');
        item.className = 'setting-item';
        item.innerHTML = `
            <div>
                <strong>${type.name}</strong>
                <div class="lab-analysis-price">${type.price} Gdes</div>
            </div>
            <div class="setting-actions">
                <button class="btn btn-secondary btn-sm" onclick="editConsultationType(${type.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteConsultationType(${type.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        consultationList.appendChild(item);
    });
    
    // Services externes
    const externalServicesList = document.getElementById('external-services-list-settings');
    externalServicesList.innerHTML = '';
    
    state.externalServices.forEach(service => {
        const item = document.createElement('div');
        item.className = 'setting-item';
        item.innerHTML = `
            <div>
                <strong>${service.name}</strong>
                <div class="lab-analysis-price">${service.price} Gdes</div>
            </div>
            <div class="setting-actions">
                <button class="btn btn-secondary btn-sm" onclick="editExternalService(${service.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteExternalService(${service.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        externalServicesList.appendChild(item);
    });
    
    // Analyses de laboratoire
    const labAnalysesList = document.getElementById('lab-analyses-list-settings');
    labAnalysesList.innerHTML = '';
    
    state.labAnalyses.forEach(analysis => {
        const item = document.createElement('div');
        item.className = 'setting-item';
        item.innerHTML = `
            <div>
                <strong>${analysis.name}</strong>
                <div class="lab-analysis-price">${analysis.price} Gdes</div>
            </div>
            <div class="setting-actions">
                <button class="btn btn-secondary btn-sm" onclick="editLabAnalysis(${analysis.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteLabAnalysis(${analysis.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        labAnalysesList.appendChild(item);
    });
}

function editConsultationType(id) {
    const type = state.consultationTypes.find(t => t.id === id);
    if (type) {
        const newPrice = prompt(`Nouveau prix pour "${type.name}" (Gdes):`, type.price);
        if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
            type.price = parseFloat(newPrice);
            updateSettingsDisplay();
            showAlert('Prix mis à jour avec succès!', 'success');
        }
    }
}

function deleteConsultationType(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de consultation?')) {
        const type = state.consultationTypes.find(t => t.id === id);
        if (type) {
            type.active = false;
            updateSettingsDisplay();
            showAlert('Type de consultation désactivé avec succès!', 'success');
        }
    }
}

function editExternalService(id) {
    const service = state.externalServices.find(s => s.id === id);
    if (service) {
        const newPrice = prompt(`Nouveau prix pour "${service.name}" (Gdes):`, service.price);
        if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
            service.price = parseFloat(newPrice);
            updateSettingsDisplay();
            loadExternalServices();
            showAlert('Prix mis à jour avec succès!', 'success');
        }
    }
}

function deleteExternalService(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service externe?')) {
        const service = state.externalServices.find(s => s.id === id);
        if (service) {
            service.active = false;
            updateSettingsDisplay();
            loadExternalServices();
            showAlert('Service externe désactivé avec succès!', 'success');
        }
    }
}

function editLabAnalysis(id) {
    const analysis = state.labAnalyses.find(a => a.id === id);
    if (analysis) {
        const newPrice = prompt(`Nouveau prix pour "${analysis.name}" (Gdes):`, analysis.price);
        if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
            analysis.price = parseFloat(newPrice);
            updateSettingsDisplay();
            showAlert('Prix mis à jour avec succès!', 'success');
        }
    }
}

function deleteLabAnalysis(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette analyse de laboratoire?')) {
        const analysis = state.labAnalyses.find(a => a.id === id);
        if (analysis) {
            analysis.active = false;
            updateSettingsDisplay();
            showAlert('Analyse de laboratoire désactivée avec succès!', 'success');
        }
    }
}

function updateDashboard() {
    document.getElementById('stat-patients').textContent = state.patients.length;
    
    const today = new Date().toLocaleDateString('fr-FR');
    const todayConsultations = state.consultations.filter(c => c.date === today).length;
    document.getElementById('stat-consultations').textContent = todayConsultations;
    
    const todayAppointments = state.appointments.filter(a => a.date === today && a.status === 'scheduled').length;
    document.getElementById('stat-appointments').textContent = todayAppointments;
    
    const pendingAnalyses = state.analyses.filter(a => a.status === 'paid' && !a.results).length;
    document.getElementById('stat-analyses').textContent = pendingAnalyses;
    
    updateNotifications();
    updateAdminNotifications();
}

function updateRoleBasedDashboard() {
    const role = state.currentRole;
    
    if (role === 'doctor') {
        updateDoctorDashboard();
    } else if (role === 'lab') {
        updateLabDashboard();
    } else if (role === 'pharmacy') {
        updatePharmacyDashboard();
    } else if (role === 'reception') {
        updateReceptionDashboard();
    } else if (role === 'cashier') {
        updateCashierDashboard();
    } else if (role === 'admin') {
        updateAdminDashboard();
    }
}

function updateDoctorDashboard() {
    const today = new Date().toLocaleDateString('fr-FR');
    
    // Calculer les revenus du docteur aujourd'hui
    const doctorTransactions = state.transactions.filter(t => 
        t.date === today && 
        t.status === 'paid' && 
        t.doctor === state.currentUser
    );
    
    const total = doctorTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = doctorTransactions.length;
    
    document.getElementById('doctor-service-total').textContent = 
        `${count} service(s) - Total: ${total.toFixed(2)} Gdes`;
    
    // Mettre à jour les rendez-vous
    updateDoctorAppointmentsDashboard();
    
    // Patients en attente
    const waitingPatientsList = document.getElementById('waiting-patients-list');
    waitingPatientsList.innerHTML = '';
    
    // Pour cet exemple, nous montrons les patients avec des consultations aujourd'hui
    const todayConsultations = state.consultations.filter(c => c.date === today && c.doctor === state.currentUser);
    
    if (todayConsultations.length === 0) {
        waitingPatientsList.innerHTML = '<p class="text-center">Aucun patient en attente aujourd\'hui</p>';
    } else {
        todayConsultations.forEach(consultation => {
            const patient = findPatient(consultation.patientId);
            if (patient) {
                const div = document.createElement('div');
                div.className = 'd-flex justify-between mb-2';
                div.innerHTML = `
                    <div>
                        <strong>${patient.name}</strong>
                        <div>${patient.id} - ${consultation.time}</div>
                    </div>
                    <div>
                        <button class="btn btn-secondary" onclick="viewPatient('${patient.id}')">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                    </div>
                `;
                waitingPatientsList.appendChild(div);
            }
        });
    }
}

function updateLabDashboard() {
    const today = new Date().toLocaleDateString('fr-FR');
    
    // Calculer les revenus du laboratoire aujourd'hui
    const labTransactions = state.transactions.filter(t => 
        t.date === today && 
        t.status === 'paid' && 
        t.service.includes('Analyses')
    );
    
    const total = labTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = labTransactions.length;
    
    document.getElementById('lab-service-total').textContent = 
        `${count} analyse(s) - Total: ${total.toFixed(2)} Gdes`;
    
    // Analyses en attente
    const pendingAnalysesDiv = document.getElementById('lab-pending-analyses');
    pendingAnalysesDiv.innerHTML = '';
    
    const pendingAnalyses = state.analyses.filter(a => a.status === 'paid' && !a.results);
    
    if (pendingAnalyses.length === 0) {
        pendingAnalysesDiv.innerHTML = '<p class="text-center">Aucune analyse en attente</p>';
    } else {
        pendingAnalyses.slice(0, 5).forEach(analysis => {
            const patient = findPatient(analysis.patientId);
            const div = document.createElement('div');
            div.className = 'd-flex justify-between mb-2';
            div.innerHTML = `
                <div>
                    <strong>${patient ? patient.name : 'N/A'}</strong>
                    <div>${analysis.analyses}</div>
                </div>
                <div>
                    <button class="btn btn-success" onclick="enterLabResults('${analysis.id}')">
                        <i class="fas fa-edit"></i> Saisir
                    </button>
                </div>
            `;
            pendingAnalysesDiv.appendChild(div);
        });
        
        if (pendingAnalyses.length > 5) {
            const moreDiv = document.createElement('div');
            moreDiv.className = 'text-center mt-2';
            moreDiv.innerHTML = `<span class="text-muted">Et ${pendingAnalyses.length - 5} autres analyses...</span>`;
            pendingAnalysesDiv.appendChild(moreDiv);
        }
    }
}

function updatePharmacyDashboard() {
    const today = new Date().toLocaleDateString('fr-FR');
    
    // Calculer les revenus de la pharmacie aujourd'hui
    const pharmacyTransactions = state.transactions.filter(t => 
        t.date === today && 
        t.status === 'paid' && 
        t.service.includes('Médicament')
    );
    
    const total = pharmacyTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = pharmacyTransactions.length;
    
    document.getElementById('pharmacy-service-total').textContent = 
        `${count} médicament(s) - Total: ${total.toFixed(2)} Gdes`;
    
    // Ordonnances en attente
    const pendingPrescriptionsDiv = document.getElementById('pharmacy-pending-prescriptions');
    pendingPrescriptionsDiv.innerHTML = '';
    
    const pendingPrescriptions = state.prescriptions.filter(p => p.status === 'paid' && !p.delivered);
    
    if (pendingPrescriptions.length === 0) {
        pendingPrescriptionsDiv.innerHTML = '<p class="text-center">Aucune ordonnance en attente</p>';
    } else {
        // Regrouper par patient
        const prescriptionsByPatient = {};
        pendingPrescriptions.forEach(p => {
            if (!prescriptionsByPatient[p.patientId]) {
                prescriptionsByPatient[p.patientId] = [];
            }
            prescriptionsByPatient[p.patientId].push(p);
        });
        
        Object.entries(prescriptionsByPatient).slice(0, 5).forEach(([patientId, prescriptions]) => {
            const patient = findPatient(patientId);
            const div = document.createElement('div');
            div.className = 'd-flex justify-between mb-2';
            div.innerHTML = `
                <div>
                    <strong>${patient ? patient.name : 'N/A'}</strong>
                    <div>${prescriptions.length} ordonnance(s)</div>
                </div>
                <div>
                    <button class="btn btn-success" onclick="document.getElementById('pharmacy-patient-id').value='${patientId}'; document.getElementById('pharmacy-search-btn').click();">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                </div>
            `;
            pendingPrescriptionsDiv.appendChild(div);
        });
    }
    
    // Stock bas
    const lowStockDiv = document.getElementById('pharmacy-low-stock');
    lowStockDiv.innerHTML = '';
    
    const lowStockItems = state.stock.filter(item => item.quantity <= item.threshold);
    
    if (lowStockItems.length === 0) {
        lowStockDiv.innerHTML = '<p class="text-center">Aucun médicament en stock bas</p>';
    } else {
        lowStockItems.slice(0, 5).forEach(item => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-between mb-2';
            div.innerHTML = `
                <div>
                    <strong>${item.medication}</strong>
                    <div class="text-danger">Stock: ${item.quantity} (Seuil: ${item.threshold})</div>
                </div>
            `;
            lowStockDiv.appendChild(div);
        });
    }
}

function updateReceptionDashboard() {
    const today = new Date().toLocaleDateString('fr-FR');
    
    // Patients enregistrés aujourd'hui
    const todayPatientsDiv = document.getElementById('reception-today-patients');
    todayPatientsDiv.innerHTML = '';
    
    const todayPatients = state.patients.filter(p => p.registrationDate === today);
    
    if (todayPatients.length === 0) {
        todayPatientsDiv.innerHTML = '<p class="text-center">Aucun patient enregistré aujourd\'hui</p>';
    } else {
        todayPatients.slice(0, 5).forEach(patient => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-between mb-2';
            div.innerHTML = `
                <div>
                    <strong>${patient.name}</strong>
                    <div>${patient.id} - ${patient.registrationTime}</div>
                </div>
                <div>
                    <span class="${patient.emergency ? 'emergency-patient-tag' : patient.pediatric ? 'pediatric-tag' : ''}">
                        ${patient.emergency ? 'URGENCE' : patient.pediatric ? 'PÉDIATRIE' : 'Normal'}
                    </span>
                </div>
            `;
            todayPatientsDiv.appendChild(div);
        });
        
        if (todayPatients.length > 5) {
            const moreDiv = document.createElement('div');
            moreDiv.className = 'text-center mt-2';
            moreDiv.innerHTML = `<span class="text-muted">Et ${todayPatients.length - 5} autres patients...</span>`;
            todayPatientsDiv.appendChild(moreDiv);
        }
    }
    
    // Rendez-vous aujourd'hui
    const todayAppointmentsDiv = document.getElementById('reception-today-appointments');
    todayAppointmentsDiv.innerHTML = '';
    
    const todayAppointments = state.appointments.filter(a => a.date === today && a.status === 'scheduled');
    
    if (todayAppointments.length === 0) {
        todayAppointmentsDiv.innerHTML = '<p class="text-center">Aucun rendez-vous aujourd\'hui</p>';
    } else {
        todayAppointments.slice(0, 5).forEach(appointment => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-between mb-2';
            div.innerHTML = `
                <div>
                    <strong>${appointment.patientName}</strong>
                    <div>${appointment.time} - ${appointment.doctor}</div>
                </div>
            `;
            todayAppointmentsDiv.appendChild(div);
        });
    }
    
    // Urgences en cours
    const activeEmergenciesDiv = document.getElementById('reception-active-emergencies');
    activeEmergenciesDiv.innerHTML = '';
    
    const activeEmergencies = state.emergencyPatients.filter(ep => ep.active);
    
    if (activeEmergencies.length === 0) {
        activeEmergenciesDiv.innerHTML = '<p class="text-center">Aucune urgence en cours</p>';
    } else {
        activeEmergencies.slice(0, 5).forEach(emergency => {
            const patient = findPatient(emergency.patientId);
            const div = document.createElement('div');
            div.className = 'd-flex justify-between mb-2';
            div.innerHTML = `
                <div>
                    <strong>${patient ? patient.name : 'N/A'}</strong>
                    <div>${emergency.admissionTime} - ${emergency.status}</div>
                </div>
                <div>
                    <span class="emergency-patient-tag">URGENCE</span>
                </div>
            `;
            activeEmergenciesDiv.appendChild(div);
        });
    }
}

function updateCashierDashboard() {
    // Mettre à jour les totaux (déjà fait dans updateCashierTotals)
    updateCashierTotals();
    
    // Transactions récentes
    const recentTransactionsDiv = document.getElementById('cashier-recent-transactions');
    recentTransactionsDiv.innerHTML = '';
    
    const recentTransactions = state.transactions.filter(t => t.status === 'paid').slice(-5).reverse();
    
    if (recentTransactions.length === 0) {
        recentTransactionsDiv.innerHTML = '<p class="text-center">Aucune transaction récente</p>';
    } else {
        recentTransactions.forEach(transaction => {
            const patient = findPatient(transaction.patientId);
            const div = document.createElement('div');
            div.className = 'd-flex justify-between mb-2';
            div.innerHTML = `
                <div>
                    <strong>${patient ? patient.name : 'N/A'}</strong>
                    <div>${transaction.service}</div>
                </div>
                <div class="text-right">
                    <div>${transaction.amount.toFixed(2)} Gdes</div>
                    <div class="text-muted" style="font-size: 0.8rem;">${transaction.date}</div>
                </div>
            `;
            recentTransactionsDiv.appendChild(div);
        });
    }
}

function updateAdminDashboard() {
    // Les statistiques générales sont déjà mises à jour dans updateDashboard()
    // Ici, nous pourrions ajouter des visualisations spécifiques à l'admin
    
    // Performance des services
    const servicePerformanceDiv = document.getElementById('service-performance');
    servicePerformanceDiv.innerHTML = '';
    
    const today = new Date().toLocaleDateString('fr-FR');
    const todayTransactions = state.transactions.filter(t => t.date === today && t.status === 'paid');
    
    // Regrouper par service
    const services = {};
    todayTransactions.forEach(t => {
        let serviceName = t.service;
        if (t.service.includes('Consultation')) {
            serviceName = 'Consultations';
        } else if (t.service.includes('Analyses')) {
            serviceName = 'Analyses';
        } else if (t.service.includes('Médicament')) {
            serviceName = 'Médicaments';
        } else if (t.service.includes('Service Externe')) {
            serviceName = 'Services Externes';
        }
        
        if (!services[serviceName]) {
            services[serviceName] = { count: 0, revenue: 0 };
        }
        services[serviceName].count++;
        services[serviceName].revenue += t.amount;
    });
    
    for (const [service, data] of Object.entries(services)) {
        const div = document.createElement('div');
        div.className = 'd-flex justify-between mb-2';
        div.innerHTML = `
            <div>
                <strong>${service}</strong>
                <div>${data.count} transaction(s)</div>
            </div>
            <div class="text-right">
                <div>${data.revenue.toFixed(2)} Gdes</div>
            </div>
        `;
        servicePerformanceDiv.appendChild(div);
    }
    
    if (Object.keys(services).length === 0) {
        servicePerformanceDiv.innerHTML = '<p class="text-center">Aucune transaction aujourd\'hui</p>';
    }
}

function updateNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    notificationsList.innerHTML = '';
    
    const today = new Date().toLocaleDateString('fr-FR');
    const notifications = [];
    
    const pendingTransactions = state.transactions.filter(t => t.status === 'pending').length;
    if (pendingTransactions > 0) {
        notifications.push({
            text: `${pendingTransactions} transaction(s) en attente de paiement`,
            type: 'warning',
            icon: 'fas fa-exclamation-triangle'
        });
    }
    
    const lowStockItems = state.stock.filter(item => item.quantity <= item.threshold).length;
    if (lowStockItems > 0) {
        notifications.push({
            text: `${lowStockItems} médicament(s) en stock bas`,
            type: 'danger',
            icon: 'fas fa-box-open'
        });
    }
    
    const pendingAnalyses = state.analyses.filter(a => a.status === 'paid' && !a.results).length;
    if (pendingAnalyses > 0) {
        notifications.push({
            text: `${pendingAnalyses} analyse(s) en attente de résultats`,
            type: 'info',
            icon: 'fas fa-flask'
        });
    }
    
    const pendingPrescriptions = state.prescriptions.filter(p => p.status === 'paid' && !p.delivered).length;
    if (pendingPrescriptions > 0) {
        notifications.push({
            text: `${pendingPrescriptions} ordonnance(s) en attente de délivrance`,
            type: 'info',
            icon: 'fas fa-pills'
        });
    }
    
    const todayConsultations = state.consultations.filter(c => c.date === today).length;
    if (todayConsultations > 0) {
        notifications.push({
            text: `${todayConsultations} consultation(s) aujourd'hui`,
            type: 'success',
            icon: 'fas fa-stethoscope'
        });
    }
    
    const todayAppointments = state.appointments.filter(a => a.date === today && a.status === 'scheduled').length;
    if (todayAppointments > 0) {
        notifications.push({
            text: `${todayAppointments} rendez-vous aujourd'hui`,
            type: 'info',
            icon: 'fas fa-calendar-day'
        });
    }
    
    const activeEmergencies = state.emergencyPatients.filter(ep => ep.active).length;
    if (activeEmergencies > 0) {
        notifications.push({
            text: `${activeEmergencies} patient(s) en urgence active`,
            type: 'danger',
            icon: 'fas fa-ambulance'
        });
    }
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p class="text-center">Aucune notification</p>';
    } else {
        notifications.forEach(notif => {
            const div = document.createElement('div');
            div.className = `alert alert-${notif.type}`;
            div.innerHTML = `<i class="${notif.icon}"></i> ${notif.text}`;
            notificationsList.appendChild(div);
        });
    }
}

function updateAdminNotifications() {
    const notificationsList = document.getElementById('admin-notifications-list');
    notificationsList.innerHTML = '';
    
    const notifications = [];
    
    // Alertes administratives spécifiques
    const lowStockItems = state.stock.filter(item => item.quantity <= item.threshold);
    if (lowStockItems.length > 0) {
        notifications.push({
            text: `${lowStockItems.length} médicament(s) en stock bas nécessitent réapprovisionnement`,
            type: 'danger',
            icon: 'fas fa-box-open'
        });
    }
    
    const unpaidEmergency = state.emergencyPatients.filter(ep => ep.active).length;
    if (unpaidEmergency > 0) {
        notifications.push({
            text: `${unpaidEmergency} patient(s) en urgence avec factures impayées`,
            type: 'warning',
            icon: 'fas fa-ambulance'
        });
    }
    
    const pendingPayments = state.transactions.filter(t => t.status === 'pending').length;
    if (pendingPayments > 0) {
        notifications.push({
            text: `${pendingPayments} transaction(s) en attente de paiement`,
            type: 'info',
            icon: 'fas fa-money-bill-wave'
        });
    }
    
    // Vérifier les employés sans pointage aujourd'hui
    const today = new Date().toLocaleDateString('fr-FR');
    const employeesWithAttendance = new Set(state.attendance.filter(a => a.date === today).map(a => a.employeeId));
    const missingAttendance = state.employees.filter(e => !employeesWithAttendance.has(e.id)).length;
    
    if (missingAttendance > 0) {
        notifications.push({
            text: `${missingAttendance} employé(s) sans pointage aujourd'hui`,
            type: 'warning',
            icon: 'fas fa-user-clock'
        });
    }
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p class="text-center">Aucune alerte administrative</p>';
    } else {
        notifications.forEach(notif => {
            const div = document.createElement('div');
            div.className = `alert alert-${notif.type}`;
            div.innerHTML = `<i class="${notif.icon}"></i> ${notif.text}`;
            notificationsList.appendChild(div);
        });
    }
}

function showAlert(message, type) {
    // Supprimer les alertes existantes
    document.querySelectorAll('.alert').forEach(alert => {
        if (alert.parentNode && !alert.parentNode.classList.contains('login-box')) {
            alert.parentNode.removeChild(alert);
        }
    });
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
        <button type="button" class="close-alert" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
    `;
    
    const currentContent = document.querySelector('.content.active');
    if (currentContent) {
        currentContent.insertBefore(alertDiv, currentContent.firstChild);
    }
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
    
    alertDiv.querySelector('.close-alert').addEventListener('click', function() {
        alertDiv.remove();
    });
}

function printContentDirectly(content, title = 'Document') {
    const printContainer = document.getElementById('print-container');
    printContainer.innerHTML = `
        <div class="printable">
            ${content}
        </div>
    `;
    
    // Attendre que le DOM soit mis à jour
    setTimeout(() => {
        window.print();
        
        // Nettoyer après impression
        setTimeout(() => {
            printContainer.innerHTML = '';
        }, 100);
    }, 100);
}

function loadDemoData() {
    state.patients = [
        {
            id: 'PA0001',
            name: 'Jean Dupont',
            dob: '1985-03-15',
            birthplace: 'Paris, France',
            phone: '06 12 34 56 78',
            address: '12 Rue de la Paix, Paris',
            responsible: '',
            registrationDate: '10/10/2023',
            registrationTime: '09:15',
            pediatric: false,
            emergency: false
        },
        {
            id: 'PA0002',
            name: 'Marie Lambert',
            dob: '1992-07-22',
            birthplace: 'Lyon, France',
            phone: '06 23 45 67 89',
            address: '45 Avenue des Champs, Lyon',
            responsible: '',
            registrationDate: '11/10/2023',
            registrationTime: '10:30',
            pediatric: false,
            emergency: false
        },
        {
            id: 'PED0001',
            name: 'Lucas Petit',
            dob: '2018-11-05',
            birthplace: 'Marseille, France',
            phone: '06 34 56 78 90',
            address: '78 Boulevard du Port, Marseille',
            responsible: 'Marie Petit',
            registrationDate: '12/10/2023',
            registrationTime: '14:20',
            pediatric: true,
            emergency: false
        },
        {
            id: 'URG0001',
            name: 'Robert Gravement',
            dob: '1965-08-30',
            birthplace: 'Lille, France',
            phone: '06 45 67 89 01',
            address: '23 Rue de la Gare, Lille',
            responsible: '',
            registrationDate: new Date().toLocaleDateString('fr-FR'),
            registrationTime: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            pediatric: false,
            emergency: true
        },
        {
            id: 'URG-PED0001',
            name: 'Emma Gravement',
            dob: '2019-05-15',
            birthplace: 'Paris, France',
            phone: '06 56 78 90 12',
            address: '34 Rue de la Santé, Paris',
            responsible: 'Sophie Gravement',
            registrationDate: new Date().toLocaleDateString('fr-FR'),
            registrationTime: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            pediatric: true,
            emergency: true
        }
    ];
    
    state.consultations = [
        {
            id: 'C-001',
            patientId: 'PA0001',
            doctor: 'Dr. Jean Martin',
            date: '12/10/2023',
            time: '10:15',
            diagnosis: 'Grippe saisonnière',
            medications: [
                {
                    name: 'Paracétamol 500mg',
                    dosage: '1 comprimé',
                    frequency: '3 fois par jour',
                    duration: '5 jours'
                },
                {
                    name: 'Vitamine C',
                    dosage: '1 comprimé',
                    frequency: '1 fois par jour',
                    duration: '10 jours'
                }
            ],
            analyses: 'Sang, Urine',
            notes: 'Repos recommandé',
            status: 'pending-payment',
            emergency: false
        },
        {
            id: 'C-002',
            patientId: 'PA0002',
            doctor: 'Dr. Marie Curie',
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            diagnosis: 'Examen de routine',
            medications: [
                {
                    name: 'Vitamine D',
                    dosage: '1 comprimé',
                    frequency: '1 fois par jour',
                    duration: '30 jours'
                }
            ],
            analyses: 'Sang',
            notes: 'À suivre dans 1 mois',
            status: 'pending-payment',
            emergency: false
        }
    ];
    
    state.analyses = [
        {
            id: 'A-001',
            patientId: 'PA0001',
            consultationId: 'C-001',
            analyses: 'Sang, Urine',
            date: '12/10/2023',
            status: 'pending-payment',
            results: 'Résultats normaux. Pas d\'anomalie détectée.',
            emergency: false
        },
        {
            id: 'A-002',
            patientId: 'PA0002',
            consultationId: 'C-002',
            analyses: 'Sang',
            date: new Date().toLocaleDateString('fr-FR'),
            status: 'pending-payment',
            results: '',
            emergency: false
        }
    ];
    
    state.prescriptions = [
        {
            id: 'R-001',
            patientId: 'PA0001',
            consultationId: 'C-001',
            prescription: 'Paracétamol 500mg - 1 comprimé 3 fois par jour pendant 5 jours',
            date: '12/10/2023',
            status: 'pending-payment',
            delivered: false,
            emergency: false
        },
        {
            id: 'R-002',
            patientId: 'PA0001',
            consultationId: 'C-001',
            prescription: 'Vitamine C - 1 comprimé par jour',
            date: '12/10/2023',
            status: 'pending-payment',
            delivered: false,
            emergency: false
        },
        {
            id: 'R-003',
            patientId: 'PA0002',
            consultationId: 'C-002',
            prescription: 'Vitamine D - 1 comprimé par jour pendant 30 jours',
            date: new Date().toLocaleDateString('fr-FR'),
            status: 'pending-payment',
            delivered: false,
            emergency: false
        }
    ];
    
    state.transactions = [
        {
            id: 'T-001',
            patientId: 'PA0001',
            service: 'Consultation',
            amount: 500,
            date: '12/10/2023',
            doctor: 'Dr. Jean Martin',
            status: 'pending',
            emergency: false
        },
        {
            id: 'T-002',
            patientId: 'PA0002',
            service: 'Consultation',
            amount: 500,
            date: new Date().toLocaleDateString('fr-FR'),
            doctor: 'Dr. Marie Curie',
            status: 'pending',
            emergency: false
        },
        {
            id: 'EXT-0001',
            patientId: 'PA0002',
            service: 'Service Externe: Pansement',
            amount: 150,
            date: new Date().toLocaleDateString('fr-FR'),
            doctor: 'Infirmière Sophie',
            status: 'pending',
            emergency: false
        }
    ];
    
    state.stock = [
        {
            id: 'MED-001',
            medication: 'Paracétamol 500mg',
            quantity: 150,
            threshold: 20,
            price: 50
        },
        {
            id: 'MED-002',
            medication: 'Ibuprofène 400mg',
            quantity: 80,
            threshold: 15,
            price: 75
        },
        {
            id: 'MED-003',
            medication: 'Amoxicilline 500mg',
            quantity: 45,
            threshold: 10,
            price: 120
        },
        {
            id: 'MED-004',
            medication: 'Vitamine C',
            quantity: 5,
            threshold: 10,
            price: 30
        },
        {
            id: 'MED-005',
            medication: 'Vitamine D',
            quantity: 60,
            threshold: 15,
            price: 90
        },
        {
            id: 'MED-006',
            medication: 'Anti-inflammatoire',
            quantity: 35,
            threshold: 10,
            price: 150
        }
    ];
    
    const today = new Date().toLocaleDateString('fr-FR');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('fr-FR');
    
    state.appointments = [
        {
            id: 'RDV-001',
            patientId: 'PA0002',
            patientName: 'Marie Lambert',
            doctor: 'Dr. Marie Curie',
            date: today,
            time: '10:00',
            reason: 'Contrôle de routine',
            status: 'scheduled',
            createdBy: 'Réceptionniste Ana',
            createdAt: new Date().toLocaleString('fr-FR')
        },
        {
            id: 'RDV-002',
            patientId: 'PED0001',
            patientName: 'Lucas Petit',
            doctor: 'Dr. Jean Martin',
            date: tomorrowStr,
            time: '14:00',
            reason: 'Suivi traitement',
            status: 'scheduled',
            createdBy: 'Réceptionniste Ana',
            createdAt: new Date().toLocaleString('fr-FR')
        }
    ];
    
    state.attendance = [
        {
            employeeId: 'EMP001',
            checkIn: '08:30',
            checkOut: '17:00',
            date: today
        },
        {
            employeeId: 'EMP005',
            checkIn: '07:45',
            checkOut: '',
            date: today
        }
    ];
    
    state.emergencyPatients = [
        {
            id: 'E-001',
            patientId: 'URG0001',
            admissionTime: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            admissionDate: today,
            doctor: 'Dr. Jean Martin',
            status: 'En traitement',
            active: true,
            notes: 'Patient arrivé en ambulance, état stable'
        },
        {
            id: 'E-002',
            patientId: 'URG-PED0001',
            admissionTime: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            admissionDate: today,
            doctor: 'Dr. Marie Curie',
            status: 'En traitement',
            active: true,
            notes: 'Enfant fiévreux, surveillance nécessaire'
        }
    ];
    
    state.employees = [
        { id: 'EMP001', name: 'Dr. Jean Martin', role: 'doctor', pin: '1234', email: 'jean.martin@hopital.fr', phone: '01 23 45 67 89', access: 'Consultation, Rendez-vous' },
        { id: 'EMP002', name: 'Dr. Marie Curie', role: 'doctor', pin: '1234', email: 'marie.curie@hopital.fr', phone: '01 23 45 67 90', access: 'Consultation, Rendez-vous' },
        { id: 'EMP003', name: 'Paul Labo', role: 'lab', pin: '1234', email: 'paul.labo@hopital.fr', phone: '01 23 45 67 91', access: 'Laboratoire' },
        { id: 'EMP004', name: 'Sophie Pharma', role: 'pharmacy', pin: '1234', email: 'sophie.pharma@hopital.fr', phone: '01 23 45 67 92', access: 'Pharmacie' },
        { id: 'EMP005', name: 'Ana Réception', role: 'reception', pin: '1234', email: 'ana.reception@hopital.fr', phone: '01 23 45 67 93', access: 'Réception, Patients, Rendez-vous' },
        { id: 'EMP006', name: 'Marc Caissier', role: 'cashier', pin: '1234', email: 'marc.caissier@hopital.fr', phone: '01 23 45 67 94', access: 'Caisse' }
    ];
    
    updatePatientsTable();
    updateLaboratoryTable();
    updateStockTable();
    updateTransactionsTable();
    updateAttendanceTable();
    updateEmployeesTable();
    updateAppointmentsLists();
    updateEmergencyPatientsTable();
}