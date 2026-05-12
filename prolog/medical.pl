% Medical Diagnosis Knowledge Base
% Symptoms database with multiple diseases and treatments

% Respiratory diseases
symptom(fever, flu).
symptom(cough, flu).
symptom(body_ache, flu).
symptom(fatigue, flu).
treatment(flu, 'Rest and stay hydrated').
treatment(flu, 'Take over-the-counter fever reducers (Acetaminophen/Ibuprofen)').
treatment(flu, 'Use humidifier for congestion').
treatment(flu, 'Consult doctor if symptoms persist beyond a week').

symptom(runny_nose, cold).
symptom(sore_throat, cold).
symptom(sneezing, cold).
symptom(cough, cold).
treatment(cold, 'Get plenty of rest (7-9 hours sleep)').
treatment(cold, 'Drink warm fluids (tea, soup, honey lemon water)').
treatment(cold, 'Use saline nasal spray for congestion').
treatment(cold, 'Take vitamin C and zinc supplements').

symptom(shortness_breath, asthma).
symptom(wheezing, asthma).
symptom(chest_tightness, asthma).
symptom(cough, asthma).
treatment(asthma, 'Use prescribed inhaler immediately').
treatment(asthma, 'Sit upright and try to stay calm').
treatment(asthma, 'Avoid triggers like smoke or allergens').
treatment(asthma, 'Seek emergency care if symptoms worsen').

% Neurological conditions
symptom(headache, migraine).
symptom(nausea, migraine).
symptom(sensitivity_light, migraine).
symptom(blurred_vision, migraine).
treatment(migraine, 'Rest in a dark, quiet room').
treatment(migraine, 'Apply cold or warm compress to head').
treatment(migraine, 'Stay hydrated and avoid triggers').
treatment(migraine, 'Consider OTC pain relievers or prescribed medication').

symptom(dizziness, vertigo).
symptom(vertigo, vertigo).
symptom(nausea, vertigo).
treatment(vertigo, 'Sit or lie down immediately to prevent falls').
treatment(vertigo, 'Avoid sudden head movements').
treatment(vertigo, 'Perform Epley maneuver if diagnosed with BPPV').
treatment(vertigo, 'Consult ENT specialist for proper diagnosis').

% Cardiovascular issues
symptom(chest_pain, heart_issue).
symptom(shortness_breath, heart_issue).
symptom(nausea, heart_issue).
symptom(sweating, heart_issue).
symptom(fatigue, heart_issue).
symptom(arm_pain, heart_issue).
treatment(heart_issue, 'CALL EMERGENCY SERVICES IMMEDIATELY (911/112)').
treatment(heart_issue, 'Chew aspirin if not allergic').
treatment(heart_issue, 'Stop all activity and rest').
treatment(heart_issue, 'Do not drive yourself to hospital').

% Digestive problems
symptom(nausea, food_poisoning).
symptom(vomiting, food_poisoning).
symptom(diarrhea, food_poisoning).
symptom(stomach_cramps, food_poisoning).
symptom(fever, food_poisoning).
treatment(food_poisoning, 'Stay hydrated with water or electrolyte solutions').
treatment(food_poisoning, 'Rest your stomach (no solid food for few hours)').
treatment(food_poisoning, 'Eat bland foods like crackers, rice, bananas').
treatment(food_poisoning, 'Seek medical help if severe dehydration or bloody stool').

symptom(heartburn, gerd).
symptom(acid_reflux, gerd).
symptom(chest_pain, gerd).
treatment(gerd, 'Avoid lying down for 3 hours after eating').
treatment(gerd, 'Elevate head while sleeping').
treatment(gerd, 'Avoid trigger foods (spicy, acidic, fatty)').
treatment(gerd, 'Take antacids or prescribed medications').

% Allergies and skin conditions
symptom(rash, allergy).
symptom(itching, allergy).
symptom(sneezing, allergy).
symptom(runny_nose, allergy).
symptom(watery_eyes, allergy).
symptom(swelling, allergy).
treatment(allergy, 'Take antihistamines (Cetirizine, Loratadine)').
treatment(allergy, 'Avoid known allergens').
treatment(allergy, 'Use cold compress for itching').
treatment(allergy, 'Seek emergency care if breathing difficulty or throat swelling').

symptom(joint_pain, arthritis).
symptom(stiffness, arthritis).
symptom(swelling, arthritis).
symptom(redness, arthritis).
treatment(arthritis, 'Apply heat or cold packs to affected joints').
treatment(arthritis, 'Gentle exercise and stretching').
treatment(arthritis, 'Take prescribed anti-inflammatory medications').
treatment(arthritis, 'Consult rheumatologist for long-term management').

% Blood conditions
symptom(fatigue, anemia).
symptom(weakness, anemia).
symptom(pale_skin, anemia).
symptom(shortness_breath, anemia).
symptom(dizziness, anemia).
treatment(anemia, 'Eat iron-rich foods (spinach, red meat, beans)').
treatment(anemia, 'Take iron supplements as prescribed').
treatment(anemia, 'Increase vitamin C intake for better iron absorption').
treatment(anemia, 'Get blood test to determine underlying cause').

% Infections
symptom(fever, infection).
symptom(chills, infection).
symptom(fatigue, infection).
symptom(body_ache, infection).
treatment(infection, 'Rest and stay hydrated').
treatment(infection, 'Monitor temperature').
treatment(infection, 'Take fever reducers if needed').
treatment(infection, 'Consult doctor if fever persists >3 days').

% COVID-19 specific
symptom(fever, covid19).
symptom(cough, covid19).
symptom(loss_of_taste_smell, covid19).
symptom(fatigue, covid19).
symptom(shortness_breath, covid19).
treatment(covid19, 'Isolate immediately to prevent spread').
treatment(covid19, 'Get tested for COVID-19').
treatment(covid19, 'Monitor oxygen levels with pulse oximeter').
treatment(covid19, 'Seek emergency care for breathing difficulty').

% Rules for diagnosis
diagnose(Symptoms, Disease) :-
    findall(D, (member(S, Symptoms), symptom(S, D)), Diseases),
    list_to_set(Diseases, UniqueDiseases),
    member(Disease, UniqueDiseases).

get_treatments(Disease, Treatments) :-
    findall(T, treatment(Disease, T), Treatments).

% Get all available symptoms
all_symptoms(Symptoms) :-
    findall(S, symptom(S, _), SymptomList),
    list_to_set(SymptomList, Symptoms).

% Main diagnosis function
diagnose_with_treatments(Symptoms, Result) :-
    findall(D, diagnose(Symptoms, D), Diseases),
    list_to_set(Diseases, UniqueDiseases),
    maplist(add_treatments, UniqueDiseases, Result).

add_treatments(Disease, disease(Disease, Treatments)) :-
    get_treatments(Disease, Treatments).