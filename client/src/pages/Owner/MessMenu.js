import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast, ToastContainer } from "react-toastify";

const MessMenu = () => {
  const [auth] = useAuth();

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const MEALS = ["breakfast", "lunch", "dinner"];

  const PRESET_FOODS = [
    "Idli","Vada","Dosa","Upma","Poori","Chapati","Rice","Sambar","Rasam",
    "Veg Curry","Paneer Curry","Dal","Curd","Veg Biryani","Egg Curry",
    "Chicken Curry","Pulao","Salad","Fruits","Curd Rice","Noodles",
    "Pasta","Tea","Coffee","Milk","Roti","Paratha","Pickle","Papad",
    "Sweet","Raita","Lemon Rice","Pongal","Uttapam","Bread","Butter",
    "Jam","Omelette"
  ];

  const [menuData, setMenuData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= MENU STRUCTURE ================= */
  const createEmptyMenu = () => {
    const menu = {};
    DAYS.forEach((day) => {
      menu[day] = { breakfast: [], lunch: [], dinner: [] };
    });
    return menu;
  };

  /* ================= LOAD MENU ================= */
  const loadMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://hostelwers.onrender.com/api/v1/mess/menu",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (res.data.menu?.menu) {
        setMenuData(res.data.menu.menu);
      } else {
        setMenuData(createEmptyMenu());
      }
    } catch (error) {
      toast.error("Failed to load mess menu");
      setMenuData(createEmptyMenu());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  /* ================= SAVE MENU ================= */
  const saveMenu = async () => {
    try {
      await axios.post(
        "https://hostelwers.onrender.com/api/v1/mess/menu",
        { menu: menuData },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      toast.success("Mess menu saved successfully");
      loadMenu(); // 🔥 reload so updated menu is visible
    } catch (error) {
      toast.error("Failed to save menu");
    }
  };

  /* ================= MENU EDIT ================= */
  const toggleFoodItem = (item) => {
    if (!selectedDay || !selectedMeal) return;

    const items = menuData[selectedDay][selectedMeal];
    const updated = items.includes(item)
      ? items.filter((i) => i !== item)
      : [...items, item];

    setMenuData({
      ...menuData,
      [selectedDay]: {
        ...menuData[selectedDay],
        [selectedMeal]: updated,
      },
    });
  };

  const clearMeal = () => {
    if (!selectedDay || !selectedMeal) return;
    if (!window.confirm("Clear this meal?")) return;

    setMenuData({
      ...menuData,
      [selectedDay]: {
        ...menuData[selectedDay],
        [selectedMeal]: [],
      },
    });
  };

  const saveWholeWeek = async () => {
    await saveMenu();
    setIsEditMode(false);
    setSelectedDay(null);
    setSelectedMeal(null);
  };

  /* ================= UI HELPERS ================= */
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const getMealIcon = (meal) => {
    if (meal === "breakfast") return "☕";
    if (meal === "lunch") return "🍛";
    return "🌙";
  };

  const getCurrentDay = () => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return days[new Date().getDay()];
  };

  if (!menuData || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading mess menu...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
            <ToastContainer position="top-left" autoClose={3000} theme="dark" />
      {!isEditMode ? (
        // VIEW MODE
        <div style={styles.viewMode}>
          <div style={styles.header}>
            <h1 style={styles.title}>🍽️ Weekly Mess Menu</h1>
            <button style={styles.editButton} onClick={() => setIsEditMode(true)}>
              🖊️ Edit Menu
            </button>
          </div>

          <div style={styles.dayGrid}>
            {DAYS.map((day) => {
              const isToday = day === getCurrentDay();
              return (
                <div key={day} style={{...styles.dayCard, ...(isToday ? styles.todayCard : {})}}>
                  <div style={styles.dayHeader}>
                    <h2 style={styles.dayTitle}>{day.toUpperCase()}</h2>
                    {isToday && <span style={styles.todayBadge}>TODAY</span>}
                  </div>

                  {MEALS.map((meal) => (
                    <div key={meal} style={styles.mealRow}>
                      <div style={styles.mealLabel}>
                        <span style={styles.mealIcon}>{getMealIcon(meal)}</span>
                        <strong>{capitalize(meal)}</strong>
                      </div>
                      <div style={styles.mealItems}>
                       {menuData[day][meal].length > 0
                        ? menuData[day][meal].join(", ")
                        : <span style={styles.notServed}>Not served</span>
                       }
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // EDIT MODE
        <div style={styles.editMode}>
          <div style={styles.editHeader}>
            <div>
              <h1 style={styles.editTitle}>Mess Menu Grid Editor</h1>
              <p style={styles.editSubtitle}>Click any slot (day × meal) and choose items from the preset list on the right.</p>
            </div>
            <div style={styles.editActions}>
              <button style={styles.saveButton} onClick={saveWholeWeek}>Save Whole Week</button>
            </div>
          </div>

          <div style={styles.gridContainer}>
            <div style={styles.gridLeft}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>DAY</th>
                    <th style={styles.th}>BREAKFAST</th>
                    <th style={styles.th}>LUNCH</th>
                    <th style={styles.th}>DINNER</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td style={styles.tdDay}>{day}</td>
                      {MEALS.map((meal) => (
                        <td key={meal} style={styles.td}>
                          <div style={styles.mealCell}>
                            {menuData[day][meal].length > 0 ? (
                            <div style={styles.mealContent}>
                            {menuData[day][meal].join(", ")}
                             </div>
                              ) : (
                               <div style={styles.emptyMeal}>-</div>
                                )}
                            <div style={styles.mealLabel2}>{meal.toUpperCase()}</div>
                          </div>
                          <button
                            style={styles.editBtn}
                            onClick={() => {
                              setSelectedDay(day);
                              setSelectedMeal(meal);
                            }}
                          >
                            EDIT
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.gridRight}>
              <div style={styles.sidebar}>
                {selectedDay && selectedMeal ? (
                  <>
                    <h3 style={styles.sidebarTitle}>{selectedDay} – {capitalize(selectedMeal)}</h3>
                    <p style={styles.sidebarSubtitle}>Preset foods are shown below. Click to toggle selection.</p>

                    <div style={styles.foodGrid}>
                      {PRESET_FOODS.map((food) => {
                        const isSelected = menuData[selectedDay][selectedMeal].includes(food);
                        return (
                          <button
                            key={food}
                            style={{
                              ...styles.foodButton,
                              ...(isSelected ? styles.foodButtonSelected : {})
                            }}
                            onClick={() => toggleFoodItem(food)}
                          >
                            {food}
                          </button>
                        );
                      })}
                    </div>

                    <div style={styles.sidebarActions}>
                      <button style={styles.saveMealButton} onClick={() => {
                        toast.success(`${selectedMeal} for ${selectedDay} updated`);
                        setSelectedDay(null);
                        setSelectedMeal(null);
                      }}>
                        Save This Meal
                      </button>
                      <button style={styles.clearMealButton} onClick={clearMeal}>
                        Clear This Meal
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={styles.noSelection}>
                    <h3 style={styles.noSelectionTitle}>Select a Slot</h3>
                    <p style={styles.noSelectionText}>Preset foods are shown below. Click to toggle selection.</p>
                    <p style={styles.noSelectionPlaceholder}>No slot selected.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontSize: "18px",
    color: "#6b7280",
  },
  loadingText: {
    fontSize: "18px",
    color: "#6b7280",
  },
  viewMode: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    backgroundColor: "#14b8a6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },
  dayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },
  dayCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "2px solid transparent",
  },
  todayCard: {
    border: "2px solid #f97316",
  },
  dayHeader: {
    padding: "16px 20px",
    backgroundColor: "white",
    borderBottom: "2px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#f97316",
    margin: "0",
  },
  todayBadge: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  mealRow: {
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  mealLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    color: "#1f2937",
  },
  mealIcon: {
    fontSize: "18px",
  },
  mealItems: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  notServed: {
    fontStyle: "italic",
    color: "#9ca3af",
  },
  editMode: {
    maxWidth: "1600px",
    margin: "0 auto",
  },
  editHeader: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  editTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    color: "#1f2937",
  },
  editSubtitle: {
    color: "#6b7280",
    margin: "0",
    fontSize: "14px",
  },
  editActions: {
    display: "flex",
    gap: "12px",
  },
  resetButton: {
    backgroundColor: "white",
    color: "#6b7280",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#14b8a6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: "20px",
  },
  gridLeft: {
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f9fafb",
    padding: "16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    borderBottom: "2px solid #e5e7eb",
  },
  tdDay: {
    padding: "20px 16px",
    fontWeight: "600",
    fontSize: "15px",
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
  mealCell: {
    marginBottom: "8px",
  },
  mealContent: {
    fontSize: "13px",
    color: "#1f2937",
    marginBottom: "4px",
  },
  emptyMeal: {
    fontSize: "18px",
    color: "#d1d5db",
    marginBottom: "4px",
  },
  mealLabel2: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  editBtn: {
    backgroundColor: "white",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    padding: "6px 16px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "500",
  },
  gridRight: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  sidebar: {
    height: "100%",
  },
  sidebarTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    color: "#1f2937",
  },
  sidebarSubtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 20px 0",
  },
  foodGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    maxHeight: "500px",
    overflowY: "auto",
    marginBottom: "20px",
    padding: "4px",
  },
  foodButton: {
    backgroundColor: "#f9fafb",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "500",
    color: "#374151",
  },
  foodButtonSelected: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
    color: "#065f46",
  },
  sidebarActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  saveMealButton: {
    backgroundColor: "#14b8a6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  clearMealButton: {
    backgroundColor: "white",
    color: "#6b7280",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
  },
  noSelection: {
    textAlign: "center",
    paddingTop: "100px",
  },
  noSelectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    color: "#1f2937",
  },
  noSelectionText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 20px 0",
  },
  noSelectionPlaceholder: {
    fontSize: "14px",
    color: "#9ca3af",
    fontStyle: "italic",
  },
};

export default MessMenu;