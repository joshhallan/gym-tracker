import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../components/common/toast.scss";
import M from "materialize-css";

const Routines = (props) => {
  const navigate = useNavigate();
  // Set routines
  const [routineName, setRoutineName] = useState("");
  const [routines, setRoutines] = useState([]);
  // Splits
  const [splitName, setSplitName] = useState("");
  const [selectedRoutine, setSelectedRoutine] = useState("");
  // Exercises
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseSplitId, setExerciseSplitId] = useState("");
  const [repRangeMin, setRepRangeMin] = useState("");
  const [repRangeMax, setRepRangeMax] = useState("");
  const [sets, setSets] = useState("");
  // Delete / view routines
  const [selectedActiveRoutineId, setSelectedActiveRoutineId] = useState(null);

  const fetchRoutinesAndSplits = async () => {
    const userId = auth.currentUser!.uid;

    const routinesSnapshot = await getDocs(
      query(collection(db, "routines"), where("userId", "==", userId))
    );
    const routinesData = routinesSnapshot.docs.map(async (routineDoc) => {
      const routineId = routineDoc.id;
      const routine = routineDoc.data();

      const splitsSnapshot = await getDocs(
        query(collection(db, "splits"), where("routineId", "==", routineId))
      );
      const splitsData = splitsSnapshot.docs.map(async (splitDoc) => {
        const splitId = splitDoc.id;
        const split = splitDoc.data();

        const exercisesSnapshot = await getDocs(
          query(collection(db, "exercises"), where("splitId", "==", splitId))
        );
        const exercises = exercisesSnapshot.docs.map((exerciseDoc) =>
          exerciseDoc.data()
        );

        return {
          ...split,
          exercises,
          splitId, // Add the split ID to the returned object
        };
      });

      const resolvedSplits = await Promise.all(splitsData);

      return {
        id: routineId,
        name: routine.name,
        splits: resolvedSplits,
      };
    });

    const combinedRoutinesData = await Promise.all(routinesData);
    setRoutines(combinedRoutinesData);
  };

  // Adds
  const addRoutine = async () => {
    const capitalizedRoutineName =
      routineName.charAt(0).toUpperCase() + routineName.slice(1);

    // Validate routine name
    if (!capitalizedRoutineName.trim()) {
      M.toast({ html: "Please enter a routine name", classes: "toast red" });
      return; // Exit the function if name is blank
    }

    try {
      let newDocRef = doc(collection(db, "routines"));
      await setDoc(newDocRef, {
        name: capitalizedRoutineName,
        userId: auth.currentUser!.uid,
        id: newDocRef.id,
        isActive: false,
      });

      M.toast({ html: "Routine saved", classes: "toast teal" });
    } catch (error) {
      console.error("Error adding routine:", error);
      M.toast({ html: "Error adding routine", classes: "toast red" });
    }

    fetchRoutinesAndSplits();
  };

  const addSplit = async () => {
    const capitalizedSplitName =
      splitName.charAt(0).toUpperCase() + splitName.slice(1);

    // Validate split name and routine ID
    if (!capitalizedSplitName.trim()) {
      M.toast({ html: "Please enter a split name", classes: "toast red" });
      return;
    }
    if (!selectedRoutine) {
      // Assuming selectedRoutine holds the routine ID
      M.toast({
        html: "Please select a routine for this split",
        classes: "toast red",
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "splits"), {
        name: capitalizedSplitName,
        routineId: selectedRoutine,
      });

      // Save the generated document ID as a field
      await updateDoc(docRef, {
        id: docRef.id,
      });

      M.toast({ html: "Split saved", classes: "toast teal" });
    } catch (error) {
      console.error("Error adding new split:", error);
      M.toast({ html: "Error adding split", classes: "toast red" });
    }

    fetchRoutinesAndSplits();
  };

  const addExercise = async () => {
    const capitalizedExerciseName =
      exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1);

    // Validate exercise name, rep range (min and max), and split ID
    if (!capitalizedExerciseName.trim()) {
      M.toast({ html: "Please enter an exercise name", classes: "toast red" });
      return;
    }
    if (repRangeMin === "" || repRangeMax === "") {
      M.toast({
        html: "Please enter valid rep range (numbers)",
        classes: "toast red",
      });
      return;
    }
    if (sets === "") {
      M.toast({
        html: "Please enter valid sets (numbers)",
        classes: "toast red",
      });
      return;
    }
    if (!exerciseSplitId) {
      M.toast({
        html: "Please select a split for this exercise",
        classes: "toast red",
      });
      return;
    }

    try {
      let collectionRef = collection(db, "exercises");
      const docRef = await addDoc(collectionRef, {
        name: capitalizedExerciseName,
        minReps: repRangeMin,
        maxReps: repRangeMax,
        splitId: exerciseSplitId,
        sets: sets,
        history: [],
      });

      // Save the generated document ID as a field
      await updateDoc(docRef, {
        id: docRef.id,
      });

      M.toast({ html: "Exercise saved", classes: "toast teal" });
    } catch (error) {
      console.error("Error adding exercise:", error);
      M.toast({ html: "Error adding exercise", classes: "toast red" });
    }

    fetchRoutinesAndSplits();
  };

  const handleRadioChange = async (event) => {
    const newRoutineId = event.target.value;
    setSelectedActiveRoutineId(newRoutineId);

    try {
      // Update the selected routine to be active in Firebase
      await updateDoc(doc(db, "routines", newRoutineId), {
        isActive: true,
      });

      // Fetch all routines for the current user
      const userId = auth.currentUser.uid;
      const routinesSnapshot = await getDocs(
        query(collection(db, "routines"), where("userId", "==", userId))
      );

      // Update each routine's isActive field based on its ID
      const updatedRoutines = await Promise.all(
        routinesSnapshot.docs.map(async (doc) => {
          const routine = doc.data();
          const updatedRoutine = {
            ...routine,
            isActive: routine.id === newRoutineId ? true : false,
          };

          // Update the routine document in Firebase
          await updateDoc(doc.ref, updatedRoutine);

          return updatedRoutine;
        })
      );

      // Update the state with the fetched and updated routines
      setRoutines(updatedRoutines);
    } catch (error) {
      console.error("Error updating routine activity:", error);
    }
  };

  // Deletes
  // Function to delete a routine
  const deleteRoutine = async (routineId) => {
    try {
      // Get all splits associated with the routine
      const splitsSnapshot = await getDocs(
        query(collection(db, "splits"), where("routineId", "==", routineId))
      );

      // Delete each split and its exercises
      splitsSnapshot.forEach(async (splitDoc) => {
        const splitId = splitDoc.id;
        await deleteDoc(doc(db, "splits", splitId));

        // Get and delete exercises associated with the split
        const exercisesSnapshot = await getDocs(
          query(collection(db, "exercises"), where("splitId", "==", splitId))
        );
        exercisesSnapshot.forEach(async (exerciseDoc) => {
          await deleteDoc(doc(db, "exercises", exerciseDoc.id));
        });
      });

      // Delete the routine itself
      await deleteDoc(doc(db, "routines", routineId));

      M.toast({ html: "Routine deleted", classes: "toast teal" });
    } catch (error) {
      console.error("Error deleting routine:", error);
      M.toast({ html: "Error deleting routine", classes: "toast red" });
    }
    fetchRoutinesAndSplits();
  };

  // Function to delete a split
  const deleteSplit = async (splitId) => {
    console.log(splitId);
    try {
      // Get and delete exercises associated with the split
      const exercisesSnapshot = await getDocs(
        query(collection(db, "exercises"), where("splitId", "==", splitId))
      );
      exercisesSnapshot.forEach(async (exerciseDoc) => {
        await deleteDoc(doc(db, "exercises", exerciseDoc.id));
      });

      // Delete the split itself
      await deleteDoc(doc(db, "splits", splitId));

      M.toast({ html: "Split deleted", classes: "toast teal" });
    } catch (error) {
      console.error("Error deleting split:", error);
      M.toast({ html: "Error deleting split", classes: "toast red" });
    }
    fetchRoutinesAndSplits();
  };

  // Function to delete an exercise
  const deleteExercise = async (exerciseId) => {
    try {
      await deleteDoc(doc(db, "exercises", exerciseId));
      M.toast({ html: "Exercise deleted", classes: "toast teal" });
    } catch (error) {
      console.error("Error deleting exercise:", error);
      M.toast({ html: "Error deleting exercise", classes: "toast red" });
    }
    fetchRoutinesAndSplits();
  };

  useEffect(() => {
    fetchRoutinesAndSplits();
    var elems = document.querySelectorAll(".collapsible");
    // @ts-ignore
    var instances = M.Collapsible.init(elems, {});
  }, []);

  useEffect(() => {
    if (props.isAuth === false) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="row">
      {/* Add routine */}
      <div className="col s12">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Create new routine</span>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="routine_name"
                  type="text"
                  className="validate"
                  onChange={(e) => setRoutineName(e.target.value)}
                />
                <label htmlFor="routine_name">
                  Routine name ie push, pull, legs
                </label>
              </div>
            </div>
          </div>
          <div className="card-action">
            <a href="#" onClick={addRoutine}>
              Add new routine
            </a>
          </div>
        </div>
      </div>
      {/* Add split to routine */}
      <div className="col s12">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Add split</span>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="split_name"
                  type="text"
                  className="validate"
                  onChange={(e) => setSplitName(e.target.value)}
                />
                <label htmlFor="split_name">Split name ie push</label>
              </div>
              <div className="input-field col s12">
                <fieldset>
                  <legend>Routines</legend>
                  {routines.map((routine) => (
                    <p>
                      <label>
                        <input
                          key={routine.id}
                          type="radio"
                          name="selectedRoutine"
                          value={routine.id}
                          onChange={(e) => setSelectedRoutine(e.target.value)}
                        />
                        <span>{routine.name}</span>
                      </label>
                    </p>
                  ))}
                </fieldset>
              </div>
            </div>
          </div>
          <div className="card-action">
            <a href="#" onClick={addSplit}>
              Add split
            </a>
          </div>
        </div>
      </div>
      {/* Add exercise to split */}
      <div className="col s12">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Add exercise</span>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="exercise_name"
                  type="text"
                  className="validate"
                  onChange={(e) => setExerciseName(e.target.value)}
                />
                <label htmlFor="exercise_name">Exercise name</label>
              </div>
              <div className="input-field col s12">
                <input
                  id="rep_range_min"
                  type="number"
                  className="validate"
                  onChange={(e) => setRepRangeMin(e.target.value)}
                />
                <label htmlFor="rep_range_min">Min reps</label>
              </div>
              <div className="input-field col s12">
                <input
                  id="rep_range_max"
                  type="number"
                  className="validate"
                  onChange={(e) => setRepRangeMax(e.target.value)}
                />
                <label htmlFor="rep_range_max">Max reps</label>
              </div>
              <div className="input-field col s12">
                <input
                  id="sets"
                  type="number"
                  className="validate"
                  onChange={(e) => setSets(e.target.value)}
                />
                <label htmlFor="sets">Sets</label>
              </div>
              <div className="input-field col s12">
                {routines.map((routine) => {
                  return (
                    <fieldset>
                      <legend>{routine.name}</legend>
                      {routine.splits &&
                        routine.splits.map((split) => {
                          return (
                            <p>
                              <label>
                                <input
                                  name="exerciseSplit"
                                  type="radio"
                                  value={split.splitId}
                                  onChange={(e) =>
                                    setExerciseSplitId(e.target.value)
                                  }
                                />
                                <span>{split.name}</span>
                              </label>
                            </p>
                          );
                        })}
                    </fieldset>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card-action">
            <a href="#" onClick={addExercise}>
              Add exercise
            </a>
          </div>
        </div>
      </div>
      {/* Delete / view routines */}
      <div className="col s12">
        <div className="card">
          <div className="card-content">
            <span className="card-title">My routines</span>
            <ul className="collapsible">
              {routines.map((routine) => (
                <li key={routine.id}>
                  <div className="collapsible-header">{routine.name}</div>
                  <div className="collapsible-body">
                    <p>
                      <label>
                        <input
                          type="radio"
                          name="routineGroup" // Ensure all radio buttons have the same name
                          value={routine.id}
                          checked={selectedActiveRoutineId === routine.id}
                          onChange={handleRadioChange}
                        />
                        <span>Set routine active</span>
                      </label>
                    </p>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="waves-effect waves-light btn red"
                    >
                      Delete Routine
                    </button>
                    <ul>
                      {routine.splits &&
                        routine.splits.map((split) => (
                          <>
                            <li key={split.id}>
                              <div className="row">
                                <div className="col s12">
                                  <h5>Split - {split.name}</h5>
                                </div>
                                <div className="col s12">
                                  <button
                                    onClick={() =>
                                      deleteSplit(split.id)
                                    }
                                    className="waves-effect waves-light btn red"
                                  >
                                    Delete Split
                                  </button>
                                </div>
                              </div>
                              <div className="section">
                                <table className="striped highlight responsive-table">
                                  <thead>
                                    <tr>
                                      <th>Exercise</th>
                                      <th>Min reps</th>
                                      <th>Max reps</th>
                                      <th>Sets</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {split.exercises.map((exercise) => (
                                      <tr key={exercise.id}>
                                        <td>{exercise.name}</td>
                                        <td>{exercise.minReps}</td>
                                        <td>{exercise.maxReps}</td>
                                        <td>{exercise.sets}</td>
                                        <td>
                                          <button
                                            onClick={() =>
                                              deleteExercise(
                                                split.id
                                              )
                                            }
                                            className="waves-effect waves-light btn red"
                                          >
                                            Delete Exercise
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="divider" />
                            </li>
                          </>
                        ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routines;
