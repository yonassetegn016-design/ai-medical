// Global variables
let selectedSymptoms = [];

// Load available symptoms
async function loadSymptoms() {
    try {
        const response = await fetch('http://localhost:3000/api/symptoms');
        const data = await response.json();
        
        const datalist = document.getElementById('symptomList');
        data.symptoms.forEach(symptom => {
            const option = document.createElement('option');
            option.value = symptom;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading symptoms:', error);
    }
}

// Add symptom
function addSymptom() {
    const input = document.getElementById('symptomSearch');
    const symptom = input.value.trim().toLowerCase();
    
    if (symptom && !selectedSymptoms.includes(symptom)) {
        selectedSymptoms.push(symptom);
        updateSelectedSymptoms();
        input.value = '';
    }
}

// Remove symptom
function removeSymptom(symptom) {
    selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    updateSelectedSymptoms();
}

// Update UI with selected symptoms
function updateSelectedSymptoms() {
    const container = document.getElementById('selectedSymptoms');
    
    if (selectedSymptoms.length === 0) {
        container.innerHTML = '<p class="placeholder">No symptoms added yet</p>';
        return;
    }
    
    container.innerHTML = selectedSymptoms.map(symptom => `
        <div class="symptom-tag">
            ${symptom}
            <span class="remove-symptom" onclick="removeSymptom('${symptom}')">×</span>
        </div>
    `).join('');
}

// Get diagnosis
async function getDiagnosis() {
    if (selectedSymptoms.length === 0) {
        alert('Please add at least one symptom');
        return;
    }
    
    const resultsSection = document.getElementById('resultsSection');
    const loading = document.getElementById('loading');
    const diagnosisResults = document.getElementById('diagnosisResults');
    
    resultsSection.style.display = 'block';
    loading.style.display = 'block';
    diagnosisResults.innerHTML = '';
    
    try {
        const response = await fetch('/api/diagnose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });
        
        const data = await response.json();
        
        loading.style.display = 'none';
        
        if (data.success && data.diagnoses.length > 0) {
            displayDiagnoses(data);
        } else {
            diagnosisResults.innerHTML = `
                <div class="diagnosis-card">
                    <h3>No matching conditions found</h3>
                    <p>Please consult a healthcare professional for proper diagnosis.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        diagnosisResults.innerHTML = `
            <div class="diagnosis-card">
                <h3>Error</h3>
                <p>Unable to connect to the server. Please try again later.</p>
            </div>
        `;
    }
}

// Display diagnosis results
function displayDiagnoses(data) {
    const diagnosisResults = document.getElementById('diagnosisResults');
    
    const urgentWarning = data.summary.requiresUrgentCare ? `
        <div class="diagnosis-card" style="background: #fee; border-color: #f00;">
            <h3>⚠️ URGENT CARE RECOMMENDED</h3>
            <p>Your symptoms suggest you may need immediate medical attention. Please seek medical care urgently.</p>
        </div>
    ` : '';
    
    const diagnosesHTML = data.diagnoses.map((diagnosis, index) => {
        const confidenceClass = diagnosis.confidence >= 70 ? 'confidence-high' : 
                               diagnosis.confidence >= 40 ? 'confidence-medium' : 'confidence-low';
        
        const severityColor = diagnosis.severity === 'High' ? '#dc2626' :
                             diagnosis.severity === 'Medium' ? '#f59e0b' : '#10b981';
        
        return `
            <div class="diagnosis-card" style="animation-delay: ${index * 0.1}s">
                <h3 class="disease-name">${diagnosis.disease}</h3>
                <div>
                    <span class="confidence ${confidenceClass}">${Math.round(diagnosis.confidence)}% Match</span>
                    <span class="severity" style="background: ${severityColor}; color: white;">${diagnosis.severity} Severity</span>
                </div>
                <p style="margin-top: 10px;"><strong>Matched Symptoms:</strong> ${diagnosis.symptomsMatched} of ${data.symptoms.length}</p>
                <div class="recommendations">
                    <h4>📋 Recommendations:</h4>
                    <ul>
                        ${diagnosis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }).join('');
    
    diagnosisResults.innerHTML = urgentWarning + diagnosesHTML;
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Event listeners
document.getElementById('addSymptomBtn').addEventListener('click', addSymptom);
document.getElementById('diagnoseBtn').addEventListener('click', getDiagnosis);
document.getElementById('symptomSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSymptom();
});

// Initialize
loadSymptoms();