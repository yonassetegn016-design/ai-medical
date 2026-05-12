const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get all available symptoms
app.get('/api/symptoms', (req, res) => {
    const prologCmd = `swipl -q -s diagnosis.pl -g "all_symptoms(S), write(S), halt."`;
    
    exec(prologCmd, (error, stdout, stderr) => {
        if (error) {
            // Fallback to static symptoms if Prolog fails
            const fallbackSymptoms = [
                'fever', 'cough', 'headache', 'body_ache', 'fatigue', 'runny_nose',
                'sore_throat', 'sneezing', 'shortness_breath', 'wheezing', 'chest_tightness',
                'nausea', 'sensitivity_light', 'blurred_vision', 'dizziness', 'vertigo',
                'chest_pain', 'sweating', 'arm_pain', 'vomiting', 'diarrhea', 'stomach_cramps',
                'heartburn', 'acid_reflux', 'rash', 'itching', 'watery_eyes', 'swelling',
                'joint_pain', 'stiffness', 'redness', 'weakness', 'pale_skin', 'chills',
                'loss_of_taste_smell'
            ];
            return res.json({ symptoms: fallbackSymptoms });
        }
        
        let symptoms = stdout.trim();
        symptoms = symptoms.replace(/\[|\]/g, '').split(',').map(s => s.trim());
        res.json({ symptoms: symptoms });
    });
});

// Diagnose endpoint
app.post('/api/diagnose', (req, res) => {
    const { symptoms } = req.body;
    
    if (!symptoms || symptoms.length === 0) {
        return res.status(400).json({ error: 'No symptoms provided' });
    }
    
    const symptomsList = '[' + symptoms.map(s => `'${s}'`).join(',') + ']';
    const prologCmd = `swipl -q -s diagnosis.pl -g "diagnose_with_treatments(${symptomsList}, R), write(R), halt."`;
    
    exec(prologCmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Prolog error:', error);
            // Fallback to JavaScript-based diagnosis
            const diagnoses = getFallbackDiagnosis(symptoms);
            return res.json({ success: true, diagnoses, symptoms });
        }
        
        try {
            let output = stdout.trim();
            if (!output || output === '[]') {
                const diagnoses = getFallbackDiagnosis(symptoms);
                return res.json({ success: true, diagnoses, symptoms });
            }
            
            // Parse Prolog output
            const diagnoses = parsePrologOutput(output, symptoms);
            res.json({ success: true, diagnoses, symptoms });
        } catch (err) {
            console.error('Parse error:', err);
            const diagnoses = getFallbackDiagnosis(symptoms);
            res.json({ success: true, diagnoses, symptoms });
        }
    });
});

// Fallback diagnosis system
function getFallbackDiagnosis(symptoms) {
    const diagnoses = [];
    
    const diseaseRules = {
        'Influenza (Flu)': { symptoms: ['fever', 'cough', 'body_ache', 'fatigue'], severity: 'Medium', minMatch: 2 },
        'Common Cold': { symptoms: ['runny_nose', 'sore_throat', 'sneezing', 'cough'], severity: 'Low', minMatch: 2 },
        'COVID-19': { symptoms: ['fever', 'cough', 'loss_of_taste_smell', 'fatigue'], severity: 'High', minMatch: 2 },
        'Migraine': { symptoms: ['headache', 'nausea', 'sensitivity_light'], severity: 'Medium', minMatch: 2 },
        'Food Poisoning': { symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach_cramps'], severity: 'Medium', minMatch: 2 },
        'Allergy': { symptoms: ['sneezing', 'runny_nose', 'rash', 'itching', 'watery_eyes'], severity: 'Low', minMatch: 2 },
        '⚠️ HEART ATTACK (Emergency)': { symptoms: ['chest_pain', 'shortness_breath', 'arm_pain', 'sweating'], severity: 'Critical', minMatch: 1 }
    };
    
    for (const [disease, rule] of Object.entries(diseaseRules)) {
        const matchedCount = rule.symptoms.filter(s => symptoms.includes(s)).length;
        if (matchedCount >= rule.minMatch) {
            const confidence = (matchedCount / rule.symptoms.length) * 100;
            diagnoses.push({
                disease: disease,
                confidence: Math.min(95, Math.round(confidence)),
                severity: rule.severity,
                symptomsMatched: matchedCount,
                recommendations: getTreatments(disease)
            });
        }
    }
    
    diagnoses.sort((a, b) => b.confidence - a.confidence);
    return diagnoses.slice(0, 5);
}

function getTreatments(disease) {
    const treatments = {
        'Influenza (Flu)': ['Rest and stay hydrated', 'Take fever reducers', 'Consult doctor if persistent'],
        'Common Cold': ['Rest and drink warm fluids', 'Use saline spray', 'Take vitamin C'],
        'COVID-19': ['Isolate immediately', 'Get tested', 'Monitor oxygen levels'],
        'Migraine': ['Rest in dark room', 'Apply cold compress', 'Stay hydrated'],
        'Food Poisoning': ['Stay hydrated', 'Rest stomach', 'Seek help if severe'],
        'Allergy': ['Take antihistamines', 'Avoid allergens', 'Use cold compress'],
        '⚠️ HEART ATTACK (Emergency)': ['CALL EMERGENCY SERVICES NOW!', 'Chew aspirin', 'Do not drive']
    };
    return treatments[disease] || ['Consult a healthcare professional', 'Monitor symptoms', 'Rest and stay hydrated'];
}

function parsePrologOutput(output, symptoms) {
    try {
        const diseaseMatches = output.match(/disease\(([^,]+),\[(.*?)\]/g);
        if (!diseaseMatches) return [];
        
        return diseaseMatches.map((match, index) => {
            const diseaseName = match.match(/disease\(([^,]+),/)[1].replace(/_/g, ' ').replace(/'/g, '');
            const treatmentsMatch = match.match(/\[(.*?)\]/);
            let treatments = treatmentsMatch ? treatmentsMatch[1].split(/','|','/) : [];
            treatments = treatments.map(t => t.replace(/'/g, '').replace(/^\[|\]$/g, ''));
            
            const matchedCount = symptoms.length;
            return {
                disease: diseaseName.charAt(0).toUpperCase() + diseaseName.slice(1),
                confidence: 75,
                severity: 'Medium',
                symptomsMatched: matchedCount,
                recommendations: treatments.length ? treatments : ['Consult a healthcare professional']
            };
        });
    } catch (e) {
        return [];
    }
}

app.listen(port, () => {
    console.log(`✅ Medical Diagnosis System running on http://localhost:${port}`);
});