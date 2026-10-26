# Acuity


**Tracking cognitive change early, so families aren't left guessing.**

Acuity is a mobile app that helps caretakers and families notice gradual cognitive decline in older adults. Changes in memory and thinking often happen too slowly to see day to day, and frequent clinical checkups are expensive. Acuity gives patients short, simple daily tests and gives caretakers a dashboard that turns the results into trends, strengths, weaknesses, and a personalized plan.

Built by a team of three students for the Congressional App Challenge.

> [App store link coming soon]

Video Playthrough:
****https://github.com/user-attachments/assets/c780b4b8-1b90-4b2a-87b8-0ca614eb4f15**
**---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Features](#features)
3. [Test Structure](#test-structure)

---

## How It Works

1. **Baseline test.** Each patient starts with an initial aptitude test that sets a baseline.
2. **Daily tests.** Short daily tests add to that data over time.
3. **Statistics algorithm.** Results from every game and activity are condensed into five core metrics plus supporting context.
4. **AI evaluation.** The Gemini API receives those metrics, along with the baseline and a summary of the patient's history, and interprets them to build a plan.
5. **Recommendation algorithm.** The plan is passed to a recommendation algorithm that decides how the app will implement it.
6. **Event list.** The recommendations become an event list that feeds back into the daily tests, adapting them to the patient and closing the feedback loop.

> <img width="1920" height="1080" alt="Acuity (1)" src="https://github.com/user-attachments/assets/faf63904-4900-4c18-82bf-ab0a58e1ac99" />

---

## Features

All of this in the same app

### For Patients
- A baseline aptitude test and adaptive daily tests
- Custom games, each targeting a specific area of brain function
- A simple, low-friction interface designed for elderly users
- Generate one code to give to every caretaker

### For Caretakers
- Add a patient with their unique patient code
- A patient dashboard showing all linked patients
- Aptitude details with a clickable breakdown by brain lobe, showing where a patient is deficient and where they're doing well
- Daily test details showing what a patient is struggling with and the plan the AI generated for them
- Easy data metrics to give to healthcare professionals to further medical help

Games:
<img width="295" height="639" alt="IMG_4349" src="https://github.com/user-attachments/assets/6fff4f47-9d16-4dff-a2c1-14635e08ffda" />
<img width="295" height="639" alt="IMG_4352" src="https://github.com/user-attachments/assets/8cd94ada-b025-4775-b492-7d729f7cc75a" />
<img width="295" height="639" alt="IMG_4351" src="https://github.com/user-attachments/assets/8510ed93-e39f-4339-b978-8114fe05bd36" />
<img width="295" height="639" alt="IMG_4350" src="https://github.com/user-attachments/assets/075701b9-55fe-4c89-896d-73c01ffa5727" />


---

## Test Structure

Each test session follows an adaptive layout based on the user's previous results:

1. **Activities.** Quick checks on delayed recall, orientation, and basic function.
2. **Custom games.** Each game targets its own area of brain function.
   - Seen it: This game requires users to remember words shown in the session, and record  as they see more words if they are repeated, or new words
   - Word Garden: This game requires users to speak the words related to the theme, to grow the garden
   - Dig Me Out: This game requires users to drag Mochi (our mascot) around obstacles like rocks and alligators to reach home
   - Pattern Factory: This game shows users a pattern with both shapes and colors, then shows another pattern asking if its same, or different
3. **Delayed recall retest.** The session circles back to recall testing at the end.

The AI will decide a plan and based on that the app renderer will render a sequential list of events with parameters different to the original based on the results. 

--
