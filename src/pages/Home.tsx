import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../components/common/toast.scss";
import M from "materialize-css";
import LineGraph from "../components/global/LineGraph";

const Home = (props: any) => {

  type Routine = {
    id?: string;
    name?: string;
    splits?: Split[];
  };

  type Split = {
    id?: string;
    name?: string;
    exercises?: Exercise[];
  };

  type Exercise = {
    id?: string;
    name?: string;
    minReps?: number;
    maxReps?: number;
    sets?: number;
    history?: { date: string; weight: number; reps: number }[];
  };

  const navigate = useNavigate();
  const [routine, setRoutines] = useState<Routine>({
    id: "",
    name: "",
    splits: [],
  });

  const fetchRoutinesAndSplits = async () => {
    const userId = auth.currentUser!.uid;

    if (auth.currentUser !== null) {
      const routinesSnapshot = await getDocs(
        query(
          collection(db, "routines"),
          where("userId", "==", userId),
          where("isActive", "==", true)
        )
      );

      if (routinesSnapshot.size > 1) {
        console.warn("Multiple routines found. Expected only one.");
      }

      const routineDoc = routinesSnapshot.docs[0];
      const routine = routineDoc.data();

      const splitsSnapshot = await getDocs(
        query(collection(db, "splits"), where("routineId", "==", routine.id))
      );
      const splitsData = splitsSnapshot.docs.map(async (splitDoc) => {
        const splitId = splitDoc.id;
        const split = splitDoc.data();

        const exercisesSnapshot = await getDocs(
          query(collection(db, "exercises"), where("splitId", "==", splitId))
        );

        const exercises = exercisesSnapshot.docs.map((exerciseDoc) => {
          const exercise = exerciseDoc.data();
          return {
            ...exercise,
            history: exercise.history || [], // Initialize history if it doesn't exist
          };
        });

        return {
          ...split,
          exercises,
          splitId, // Add the split ID to the returned object
        };
      });

      let resolvedSplits = await Promise.all(splitsData);
      
      setRoutines({id: routine.id, name: routine.name, splits: resolvedSplits})
    }
  };

  const addExerciseEntry = async (exerciseId: string) => {
    event.preventDefault();

    const weightInput: HTMLInputElement = document.getElementById(
      `weight${exerciseId}`
    ) as HTMLInputElement;
    const repsInput: HTMLInputElement = document.getElementById(
      `reps${exerciseId}`
    ) as HTMLInputElement;

    const weight = parseFloat(weightInput.value);
    const reps = parseInt(repsInput.value);

    // Validate weight and reps
    if (isNaN(weight) || weight <= 0) {
      M.toast({
        html: "Please enter a valid weight (greater than 0)",
        classes: "toast red",
      });
      return; // Exit the function if validation fails
    }

    if (isNaN(reps) || reps <= 0) {
      M.toast({
        html: "Please enter a valid number of reps (greater than 0)",
        classes: "toast red",
      });
      return;
    }

    try {
      // Update the exercise history within the routine
      const exerciseDocRef = doc(db, "exercises", exerciseId);
      const exerciseDoc = await getDoc(exerciseDocRef);
      const exerciseData = exerciseDoc.data();

      const today = new Date(); // Create a new Date object
      const formattedDate = today.toLocaleDateString("en-GB", {
        // Use 'en-GB' locale for dd/mm/yyyy format
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const updatedHistory = [
        ...exerciseData.history,
        { weight, reps, date: formattedDate },
      ];

      await updateDoc(exerciseDocRef, {
        history: updatedHistory,
      });

      // Success toast
      M.toast({
        html: "Exercise entry added successfully",
        classes: "toast teal",
      });

      fetchRoutinesAndSplits();
    } catch (error) {
      console.error("Error adding exercise entry:", error);
      // Error toast
      M.toast({
        html: "Failed to add exercise entry. Please try again",
        classes: "toast red",
      });
    }
  };

  const handleDeleteHistoryEntry = async (exerciseId, entryIndex) => {
    try {
      // Get a reference to the exercise document
      const exerciseDocRef = doc(db, "exercises", exerciseId);

      // Fetch the current exercise data
      const exerciseDoc = await getDoc(exerciseDocRef);
      const exerciseData = exerciseDoc.data();

      // Check if history exists before accessing it
      if (exerciseData && exerciseData.history) {
        // Create a copy of the history array
        const updatedHistory = [...exerciseData.history];

        // Remove the entry at the specified index
        updatedHistory.splice(entryIndex, 1);

        // Update the exercise document with the modified history
        await updateDoc(exerciseDocRef, {
          history: updatedHistory,
        });

        // Success toast
        M.toast({
          html: "Exercise entry deleted successfully",
          classes: "toast teal",
        });

        fetchRoutinesAndSplits();
      } else {
        console.warn("Exercise data doesn't have a history property");
        // Handle the case where there's no history (optional: display a message)
      }
    } catch (error) {
      console.error("Error deleting exercise entry:", error);
      // Error toast
      M.toast({
        html: "Failed to delete exercise entry. Please try again",
        classes: "toast red",
      });
    }
  };

  useEffect(() => {
    fetchRoutinesAndSplits();
  }, []);

  useEffect(() => {
    var elems = document.querySelectorAll(".collapsible");
    // @ts-ignore
    var instances = M.Collapsible.init(elems, {});
  }, [routine]);

  useEffect(() => {
    if (props.isAuth === false) {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col s12 m6">
          <div className="card">
            <div className="card-content">
              <span className="card-title">Information</span>
              <p>Active routine</p>
              <ul className="collection">
                <li className="collection-item">{routine.name}</li>
              </ul>
              <p>Splits</p>
              <ul className="collection">
                {routine.splits &&
                  routine.splits.map((split: any) => (
                    <li key={split.id} className="collection-item">
                      {split.name}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {routine.splits &&
        routine.splits.map((split: any) => (
          <div className="row" key={split.id}>
            <div className="col s12">
              <div className="card ">
                <div className="card-content">
                  <span className="card-title">{split.name}</span>
                  <ul className="collapsible">
                    {split.exercises &&
                      split.exercises.map((exercise) => {
                        return (
                          <li key={exercise.id}>
                            <div className="collapsible-header">
                              {exercise.name}
                            </div>
                            <div className="collapsible-body">
                              <div className="row">
                                <div className="col s12">
                                  <h3>Exercise information</h3>
                                  <ul>
                                    <li>Min reps: {exercise.minReps}</li>
                                    <li>Max reps: {exercise.maxReps}</li>
                                    <li>Sets: {exercise.sets}</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="row">
                                {exercise.history.length > 0 ? (
                                  <>
                                    <div className="col s12">
                                      <h3>Historical data</h3>
                                      <LineGraph
                                        data={exercise.history.map(
                                          ({ date, weight }) => ({
                                            x: new Date(
                                              date
                                            ).toLocaleDateString(),
                                            y: weight,
                                          })
                                        )}
                                      />
                                    </div>
                                    <div className="col s12">
                                      <table className="striped responsive-table">
                                        <thead>
                                          <tr>
                                            <th>Date</th>
                                            <th>Reps</th>
                                            <th>Weight</th>
                                            <th>Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {exercise.history.length > 0 &&
                                            exercise.history.map(
                                              (exerciseEntry, index) => {
                                                return (
                                                  <tr>
                                                    <td>
                                                      {exerciseEntry.date}
                                                    </td>
                                                    <td>
                                                      {exerciseEntry.reps}
                                                    </td>
                                                    <td>
                                                      {exerciseEntry.weight}
                                                    </td>
                                                    <td>
                                                      <button
                                                        className="btn-small red"
                                                        onClick={() =>
                                                          handleDeleteHistoryEntry(
                                                            exercise.id,
                                                            index
                                                          )
                                                        }
                                                      >
                                                        Delete
                                                      </button>
                                                    </td>
                                                  </tr>
                                                );
                                              }
                                            )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </>
                                ) : (
                                  <div className="col s12">
                                    <h3>Historical data</h3>
                                    <h6>No historical data available</h6>
                                  </div>
                                )}

                                <div className="col s12 l6">
                                  <h3>Add entry</h3>
                                  <form
                                    onSubmit={() =>
                                      addExerciseEntry(exercise.id)
                                    }
                                  >
                                    <div className="row">
                                      <div className="col s12">
                                        <div className="row">
                                          <div className="input-field col s12">
                                            <input
                                              id={"weight" + exercise.id}
                                              type="number"
                                            />
                                            <label
                                              htmlFor={"weight" + exercise.id}
                                            >
                                              Weight
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col s12">
                                        <div className="row">
                                          <div className="input-field col s12">
                                            <input
                                              id={"reps" + exercise.id}
                                              type="text"
                                            />
                                            <label
                                              htmlFor={"reps" + exercise.id}
                                            >
                                              Reps per set ie 8,8,8
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col s12">
                                        <button type="submit" className="btn">
                                          Add exercise
                                        </button>
                                      </div>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Home;
