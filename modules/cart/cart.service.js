import { db } from "../../config/database.js";


// export const addToCart = (req, res) => {

// const userId = req.user_data.id;

// const {
// medicineId,
// pharmacyId,
// quantity
// } = req.body;

// if (!medicineId || !pharmacyId || !quantity) {
// return res.status(400).json({
// message: "All fields are required"
// });
// }

// const getCartQuery = `     SELECT *
//     FROM cart
//     WHERE UserId = ?
//   `;

// db.execute(
// getCartQuery,
// [userId],
// (err, cartResult) => {

//   if (err) {
//     return res.status(500).json({
//       message: err.message
//     });
//   }

//   const continueWithCart = (cartId) => {

//     // التأكد أن الكارت من صيدلية واحدة
//     const pharmacyCheckQuery = `
//       SELECT DISTINCT PharmacyId
//       FROM cart_items
//       WHERE CartId = ?
//     `;

//     db.execute(
//       pharmacyCheckQuery,
//       [cartId],
//       (err, pharmacyResult) => {

//         if (err) {
//           return res.status(500).json({
//             message: err.message
//           });
//         }

//         if (
//           pharmacyResult.length > 0 &&
//           pharmacyResult[0].PharmacyId != pharmacyId
//         ) {
//           return res.status(400).json({
//             message:
//               "Cart can contain medicines from only one pharmacy"
//           });
//         }

//         // التأكد أن الدواء موجود في الصيدلية
//         const medicineAvailabilityQuery = `
//           SELECT *
//           FROM pharmacymedicine
//           WHERE PharmacyId = ?
//           AND MedicineId = ?
//         `;

//         db.execute(
//           medicineAvailabilityQuery,
//           [pharmacyId, medicineId],
//           (err, medicineResult) => {

//             if (err) {
//               return res.status(500).json({
//                 message: err.message
//               });
//             }

//             if (medicineResult.length === 0) {
//               return res.status(404).json({
//                 message:
//                   "Medicine not available in this pharmacy"
//               });
//             }

//             // التأكد من الكمية
//             if (
//               quantity >
//               medicineResult[0].Quantity
//             ) {
//               return res.status(400).json({
//                 message:
//                   `Only ${medicineResult[0].Quantity} available in stock`
//               });
//             }

//             // هل الدواء موجود بالفعل؟
//             const itemCheckQuery = `
//               SELECT *
//               FROM cart_items
//               WHERE CartId = ?
//               AND MedicineId = ?
//             `;

//             db.execute(
//               itemCheckQuery,
//               [cartId, medicineId],
//               (err, itemResult) => {

//                 if (err) {
//                   return res.status(500).json({
//                     message: err.message
//                   });
//                 }

//                 // موجود بالفعل => زود الكمية
//                 if (itemResult.length > 0) {

//                   const newQuantity =
//                     itemResult[0].Quantity +
//                     Number(quantity);

//                   if (
//                     newQuantity >
//                     medicineResult[0].Quantity
//                   ) {
//                     return res.status(400).json({
//                       message:
//                         `Only ${medicineResult[0].Quantity} available in stock`
//                     });
//                   }

//                   const updateQuery = `
//                     UPDATE cart_items
//                     SET Quantity = ?
//                     WHERE CartId = ?
//                     AND MedicineId = ?
//                   `;

//                   return db.execute(
//                     updateQuery,
//                     [
//                       newQuantity,
//                       cartId,
//                       medicineId
//                     ],
//                     (err) => {

//                       if (err) {
//                         return res.status(500).json({
//                           message: err.message
//                         });
//                       }

//                       return res.status(200).json({
//                         message:
//                           "Cart updated successfully"
//                       });

//                     }
//                   );
//                 }

//                 // إضافة دواء جديد للكارت
//                 const insertItemQuery = `
//                   INSERT INTO cart_items
//                   (
//                     CartId,
//                     MedicineId,
//                     PharmacyId,
//                     Quantity
//                   )
//                   VALUES (?, ?, ?, ?)
//                 `;

//                 db.execute(
//                   insertItemQuery,
//                   [
//                     cartId,
//                     medicineId,
//                     pharmacyId,
//                     quantity
//                   ],
//                   (err) => {

//                     if (err) {
//                       return res.status(500).json({
//                         message: err.message
//                       });
//                     }

//                     return res.status(201).json({
//                       message:
//                         "Medicine added to cart successfully"
//                     });

//                   }
//                 );

//               }
//             );

//           }
//         );

//       }
//     );

//   };

//   // لو الكارت موجودة
//   if (cartResult.length > 0) {

//     continueWithCart(
//       cartResult[0].Id
//     );

//   } else {

//     // إنشاء كارت جديدة
//     const createCartQuery = `
//       INSERT INTO cart (UserId)
//       VALUES (?)
//     `;

//     db.execute(
//       createCartQuery,
//       [userId],
//       (err, result) => {

//         if (err) {
//           return res.status(500).json({
//             message: err.message
//           });
//         }

//         continueWithCart(
//           result.insertId
//         );

//       }
//     );

//   }

// }

// );

// };
 
export const addToCart = (req, res) => {

  const userId = req.user_data.id;

  const {
    medicineId,
    pharmacyId,
    quantity
  } = req.body;

  if (!medicineId || !pharmacyId || !quantity) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const getCartQuery = `
    SELECT *
    FROM cart
    WHERE UserId = ?
  `;

  db.execute(
    getCartQuery,
    [userId],
    (err, cartResult) => {

      if (err) {
        return res.status(500).json({
          message: err.message
        });
      }

      const continueWithCart = (cartId) => {

        // التأكد أن الكارت من صيدلية واحدة
        const pharmacyCheckQuery = `
          SELECT DISTINCT PharmacyId
          FROM cart_items
          WHERE CartId = ?
        `;

        db.execute(
          pharmacyCheckQuery,
          [cartId],
          (err, pharmacyResult) => {

            if (err) {
              return res.status(500).json({
                message: err.message
              });
            }

            if (
              pharmacyResult.length > 0 &&
              pharmacyResult[0].PharmacyId != pharmacyId
            ) {
              return res.status(400).json({
                message:
                  "Cart can contain medicines from only one pharmacy"
              });
            }

            // التأكد أن الدواء موجود في الصيدلية
            const medicineAvailabilityQuery = `
              SELECT *
              FROM pharmacymedicine
              WHERE PharmacyId = ?
              AND MedicineId = ?
            `;

            db.execute(
              medicineAvailabilityQuery,
              [pharmacyId, medicineId],
              (err, medicineResult) => {

                if (err) {
                  return res.status(500).json({
                    message: err.message
                  });
                }

                if (medicineResult.length === 0) {
                  return res.status(404).json({
                    message:
                      "Medicine not available in this pharmacy"
                  });
                }

                if (
                  quantity >
                  medicineResult[0].Quantity
                ) {
                  return res.status(400).json({
                    message:
                      `Only ${medicineResult[0].Quantity} available in stock`
                  });
                }

                // التحقق من الـ Drug Interaction
                const interactionQuery = `
                  SELECT
                    umm.Name AS UserMedicine,
                    di.Interaction_Description
                  FROM usermedicine um

                  JOIN medicine umm
                    ON umm.Id = um.MedicineId

                  JOIN medicine cartMed
                    ON cartMed.Id = ?

                  JOIN druginteractions di
                    ON (
                      (
                        LOWER(di.Drug_1) = LOWER(cartMed.Name)
                        AND LOWER(di.Drug_2) = LOWER(umm.Name)
                      )
                      OR
                      (
                        LOWER(di.Drug_2) = LOWER(cartMed.Name)
                        AND LOWER(di.Drug_1) = LOWER(umm.Name)
                      )
                    )

                  WHERE um.UserID = ?
                  AND um.status = 'active'
                `;

                db.execute(
                  interactionQuery,
                  [medicineId, userId],
                  (err, interactions) => {

                    if (err) {
                      return res.status(500).json({
                        message: err.message
                      });
                    }

                    const warningData = interactions.map(item => ({
                      userMedicine: item.UserMedicine,
                      description: item.Interaction_Description
                    }));

                    // هل الدواء موجود بالفعل؟
                    const itemCheckQuery = `
                      SELECT *
                      FROM cart_items
                      WHERE CartId = ?
                      AND MedicineId = ?
                    `;

                    db.execute(
                      itemCheckQuery,
                      [cartId, medicineId],
                      (err, itemResult) => {

                        if (err) {
                          return res.status(500).json({
                            message: err.message
                          });
                        }

                        // موجود بالفعل
                        if (itemResult.length > 0) {

                          const newQuantity =
                            itemResult[0].Quantity +
                            Number(quantity);

                          if (
                            newQuantity >
                            medicineResult[0].Quantity
                          ) {
                            return res.status(400).json({
                              message:
                                `Only ${medicineResult[0].Quantity} available in stock`
                            });
                          }

                          const updateQuery = `
                            UPDATE cart_items
                            SET Quantity = ?
                            WHERE CartId = ?
                            AND MedicineId = ?
                          `;

                          return db.execute(
                            updateQuery,
                            [
                              newQuantity,
                              cartId,
                              medicineId
                            ],
                            (err) => {

                              if (err) {
                                return res.status(500).json({
                                  message: err.message
                                });
                              }

                              return res.status(200).json({
                                message:
                                  "Cart updated successfully",
                                warning:
                                  warningData.length > 0,
                                interactions:
                                  warningData
                              });

                            }
                          );
                        }

                        // إضافة دواء جديد للكارت
                        const insertItemQuery = `
                          INSERT INTO cart_items
                          (
                            CartId,
                            MedicineId,
                            PharmacyId,
                            Quantity
                          )
                          VALUES (?, ?, ?, ?)
                        `;

                        db.execute(
                          insertItemQuery,
                          [
                            cartId,
                            medicineId,
                            pharmacyId,
                            quantity
                          ],
                          (err) => {

                            if (err) {
                              return res.status(500).json({
                                message: err.message
                              });
                            }

                            return res.status(201).json({
                              message:
                                "Medicine added to cart successfully",
                              warning:
                                warningData.length > 0,
                              interactions:
                                warningData
                            });

                          }
                        );

                      }
                    );

                  }
                );

              }
            );

          }
        );

      };

      // لو عنده cart
      if (cartResult.length > 0) {

        continueWithCart(
          cartResult[0].Id
        );

      } else {

        const createCartQuery = `
          INSERT INTO cart (UserId)
          VALUES (?)
        `;

        db.execute(
          createCartQuery,
          [userId],
          (err, result) => {

            if (err) {
              return res.status(500).json({
                message: err.message
              });
            }

            continueWithCart(
              result.insertId
            );

          }
        );

      }

    }
  );

};

export const getCart = (req, res) => {

const userId = req.user_data.id;

const query = `     SELECT
      ci.MedicineId,
      m.Name,
      ci.Quantity,
      pm.Price,
      (ci.Quantity * pm.Price) AS ItemTotal,

      p.Id AS PharmacyId,
      p.Name AS PharmacyName,
      p.Location AS PharmacyLocation

    FROM cart c

    JOIN cart_items ci
      ON c.Id = ci.CartId

    JOIN medicine m
      ON m.Id = ci.MedicineId

    JOIN pharmacymedicine pm
      ON pm.MedicineId = ci.MedicineId
      AND pm.PharmacyId = ci.PharmacyId

    JOIN pharmacy p
      ON p.Id = ci.PharmacyId

    WHERE c.UserId = ?
`;

db.execute(
query,
[userId],
(err, result) => {

  if (err) {
    return res.status(500).json({
      message: err.message
    });
  }

  if (result.length === 0) {
    return res.status(404).json({
      message: "Cart is empty"
    });
  }

  let totalPrice = 0;

  result.forEach(item => {
    totalPrice += Number(item.ItemTotal);
  });

  return res.status(200).json({
    items: result,
    totalPrice
  });

}

);

};

export const updateCartItem = (req, res) => {

const userId = req.user_data.id;

const {
medicineId,
quantity
} = req.body;

if (!medicineId || !quantity) {
return res.status(400).json({
message: "Missing data"
});
}

const query = `     UPDATE cart_items ci
    JOIN cart c
      ON c.Id = ci.CartId
    SET ci.Quantity = ?
    WHERE c.UserId = ?
    AND ci.MedicineId = ?
  `;

db.execute(
query,
[
quantity,
userId,
medicineId
],
(err, result) => {

  if (err) {
    return res.status(500).json({
      message: err.message
    });
  }

  if (result.affectedRows === 0) {
    return res.status(404).json({
      message: "Medicine not found in cart"
    });
  }

  return res.status(200).json({
    message: "Quantity updated"
  });

}

);

};

export const removeCartItem = (req, res) => {

const userId = req.user_data.id;

const { medicineId } = req.body;

const query = `     DELETE ci
    FROM cart_items ci
    JOIN cart c
      ON c.Id = ci.CartId
    WHERE c.UserId = ?
    AND ci.MedicineId = ?
  `;

db.execute(
query,
[
userId,
medicineId
],
(err, result) => {

  if (err) {
    return res.status(500).json({
      message: err.message
    });
  }

  if (result.affectedRows === 0) {
    return res.status(404).json({
      message: "Medicine not found"
    });
  }

  return res.status(200).json({
    message: "Medicine removed"
  });

}

);

};

export const clearCart = (req, res) => {

const userId = req.user_data.id;

const query = `     DELETE ci
    FROM cart_items ci
    JOIN cart c
      ON c.Id = ci.CartId
    WHERE c.UserId = ?
  `;

db.execute(
query,
[userId],
(err) => {

  if (err) {
    return res.status(500).json({
      message: err.message
    });
  }

  return res.status(200).json({
    message: "Cart cleared successfully"
  });

}

);

};

export const checkoutCart = (req, res) => {

  const userId = req.user_data.id;

  const {
    userPhone,
    userAddress,
    orderType
  } = req.body;

  if (!userPhone || !userAddress || !orderType) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const cartQuery = `
    SELECT
      ci.MedicineId,
      ci.PharmacyId,
      ci.Quantity,
      pm.Price,
      pm.Quantity AS StockQuantity
    FROM cart c
    JOIN cart_items ci
      ON c.Id = ci.CartId
    JOIN pharmacymedicine pm
      ON pm.MedicineId = ci.MedicineId
      AND pm.PharmacyId = ci.PharmacyId
    WHERE c.UserId = ?
  `;

  db.execute(
    cartQuery,
    [userId],
    (err, cartItems) => {

      if (err) {
        return res.status(500).json({
          message: err.message
        });
      }

      if (cartItems.length === 0) {
        return res.status(400).json({
          message: "Cart is empty"
        });
      }

      // التأكد من الكميات
      for (let item of cartItems) {

        if (item.Quantity > item.StockQuantity) {

          return res.status(400).json({
            message: `Medicine ${item.MedicineId} has only ${item.StockQuantity} left`
          });

        }

      }

      const pharmacyId = cartItems[0].PharmacyId;

      let totalPrice = 0;

      cartItems.forEach(item => {

        totalPrice +=
          Number(item.Price) *
          Number(item.Quantity);

      });

      const createOrderQuery = `
        INSERT INTO orders
        (
          UserId,
          PharmacyId,
          TotalPrice,
          OrderStatus,
          UserPhone,
          UserAddress,
          OrderType
        )
        VALUES
        (
          ?, ?, ?, ?, ?, ?, ?
        )
      `;

      db.execute(
        createOrderQuery,
        [
          userId,
          pharmacyId,
          totalPrice,
          "Pending",
          userPhone,
          userAddress,
          orderType
        ],
        (err, orderResult) => {

          if (err) {
            return res.status(500).json({
              message: err.message
            });
          }

          const orderId = orderResult.insertId;

          let completed = 0;

          cartItems.forEach(item => {

            const detailsQuery = `
              INSERT INTO orderdetails
              (
                OrderId,
                MedicineId,
                Price,
                Quantity
              )
              VALUES (?, ?, ?, ?)
            `;

            db.execute(
              detailsQuery,
              [
                orderId,
                item.MedicineId,
                item.Price,
                item.Quantity
              ],
              (err) => {

                if (err) {
                  return res.status(500).json({
                    message: err.message
                  });
                }

                const stockQuery = `
                  UPDATE pharmacymedicine
                  SET Quantity = Quantity - ?
                  WHERE PharmacyId = ?
                  AND MedicineId = ?
                `;

                db.execute(
                  stockQuery,
                  [
                    item.Quantity,
                    item.PharmacyId,
                    item.MedicineId
                  ],
                  (err) => {

                    if (err) {
                      return res.status(500).json({
                        message: err.message
                      });
                    }

                    completed++;

                    if (completed === cartItems.length) {

                      const clearCartQuery = `
                        DELETE ci
                        FROM cart_items ci
                        JOIN cart c
                          ON c.Id = ci.CartId
                        WHERE c.UserId = ?
                      `;

                      db.execute(
                        clearCartQuery,
                        [userId],
                        (err) => {

                          if (err) {
                            return res.status(500).json({
                              message: err.message
                            });
                          }

                          return res.status(201).json({
                            message: "Order created successfully",
                            orderId,
                            totalPrice
                          });

                        }
                      );

                    }

                  }
                );

              }
            );

          });

        }
      );

    }
  );

};


// export const addToCart = (req, res) => {

// const userId = req.user_data.id;
// console.log(req.user_data);
// const {
// medicineId,
// pharmacyId,
// quantity
// } = req.body;

// if (!medicineId || !pharmacyId || !quantity) {
// return res.status(400).json({
// message: "All fields are required"
// });
// }

// const getCartQuery = `     SELECT *
//     FROM cart
//     WHERE UserId = ?
//   `;

// console.log("userId =", userId);
// console.log("medicineId =", medicineId);
// console.log("pharmacyId =", pharmacyId);
// console.log("quantity =", quantity);

// db.execute(
// getCartQuery,
// [userId],
// (err, cartResult) => {

//   if (err) {
//     return res.status(500).json({
//       message: err.message
//     });
//   }

//   const continueWithCart = (cartId) => {

//     const pharmacyCheckQuery = `
//   SELECT DISTINCT PharmacyId
//   FROM cart_items
//   WHERE CartId = ?
// `;
//     db.execute(
//       pharmacyCheckQuery,
//       [cartId],
//       (err, pharmacyResult) => {

//         if (err) {
//           return res.status(500).json({
//             message: err.message
//           });
//         }

//         if (
//           pharmacyResult.length > 0 &&
//           pharmacyResult[0].PharmacyId != pharmacyId
//         ) {
//           return res.status(400).json({
//             message:
//             "Cart can contain medicines from only one pharmacy"
//           });
//         }

//         // هل الدواء موجود بالفعل؟
//         const itemCheckQuery = `
//           SELECT *
//           FROM cart_items
//           WHERE CartId = ?
//           AND MedicineId = ?
//         `;

//         db.execute(
//           itemCheckQuery,
//           [cartId, medicineId],
//           (err, itemResult) => {

//             if (err) {
//               return res.status(500).json({
//                 message: err.message
//               });
//             }

//             // موجود بالفعل => زود الكمية
//             if (itemResult.length > 0) {

//               const updateQuery = `
//                 UPDATE cart_items
//                 SET Quantity = Quantity + ?
//                 WHERE CartId = ?
//                 AND MedicineId = ?
//               `;

//               return db.execute(
//                 updateQuery,
//                 [
//                   quantity,
//                   cartId,
//                   medicineId
//                 ],
//                 (err) => {

//                   if (err) {
//                     return res.status(500).json({
//                       message: err.message
//                     });
//                   }

//                   return res.status(200).json({
//                     message:
//                     "Cart updated successfully"
//                   });

//                 }
//               );
//             }

//             // إضافة منتج جديد
//             const insertItemQuery = `
//               INSERT INTO cart_items
//               (
//                 CartId,
//                 MedicineId,
//                 PharmacyId,
//                 Quantity
//               )
//               VALUES (?, ?, ?, ?)
//             `;

//             db.execute(
//               insertItemQuery,
//               [
//                 cartId,
//                 medicineId,
//                 pharmacyId,
//                 quantity
//               ],
//               (err) => {

//                 if (err) {
//                   return res.status(500).json({
//                     message: err.message
//                   });
//                 }

//                 return res.status(201).json({
//                   message:
//                   "Medicine added to cart successfully"
//                 });

//               }
//             );

//           }
//         );

//       }
//     );

//   };

//   // لو عنده cart
//   if (cartResult.length > 0) {

//     continueWithCart(cartResult[0].Id);

//   } else {

//     // إنشاء cart جديدة
//     const createCartQuery = `
//       INSERT INTO cart (UserId)
//       VALUES (?)
//     `;

//     db.execute(
//       createCartQuery,
//       [userId],
//       (err, result) => {

//         if (err) {
//           return res.status(500).json({
//             message: err.message
//           });
//         }

//         continueWithCart(result.insertId);

//       }
//     );

//   }

// }

// );

// };
