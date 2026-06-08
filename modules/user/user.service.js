import { db } from "../../config/database.js";

import bcrypt from "bcrypt";
//////////////////////////////////////////////////////////////////////////////
export const get_profile = (req, res) => {
try {
  
    const { user_data } = req;
    console.log(user_data);
    
 if (!user_data)
  return res.status(500).json({msg:"error in server to get user data"})

 res.status(200).json({sucess:true , msg:"success done" , data :user_data})
} catch (error) {
  res.status(500).json({sucess:false , msg:error.message})
}
};

//////////////////////////////////////////////////////////////////
export const update_profile = async (req, res) => {
  try {

    const {user_data} = req 
    const {
      name,
      password,
      old_password,
      phone,
      location,
      ProfileImagePath,
    } = req.body;

    let fields = [];
  let values=[];

    if (name) {
      fields.push("Name = ?");
      values.push(name);
    }

    if (phone) {
      fields.push("Phone = ?");
      values.push(phone);
    }

    if (location) {
      fields.push("Location = ?");
      values.push(location);
    }

    if (ProfileImagePath) {
      fields.push("ProfileImagePath = ?");
      values.push(ProfileImagePath);
    }

   if (password) {

  const [result] = await db.promise().query(
    "SELECT Password FROM users WHERE Id = ?",
    [user_data.id]
  );

  const comparePassword = bcrypt.compareSync(
    old_password,
    result[0].Password
  );

  if (!comparePassword) {
    return res.status(400).json({
      msg: "the old password is wrong"
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  fields.push("Password = ?");
  values.push(hashedPassword);
}

    // ❌ مفيش أي حاجة تتحدث
    if (fields.length === 0) {
      return res.status(400).json({ msg: "No data to update" });
    }

    const query = `
      UPDATE users 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `;

   
values.push(user_data.id)

    db.execute(query, values, (error, result) => {
      if (error) return res.status(500).json({ msg: error.message  , stack:error.stack});
      res.status(200).json({ msg: "Profile updated", data: result });
    });
  } catch (error) {
    res.status(500).json({ success:false,msg: error.message , stack:error.stack});
  }
};


///////////////////////////////////////////////////////////////////


// controllers/medicineController.js

 export const home_getall_medicine = (req, res) => {
  try {
    // 1. استخراج الإحداثيات وتحويلها لأرقام صريحة لتجنب مشاكل الـ Types
    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng);
    const radius = parseFloat(req.query.radius) || 10;

    if (!lat || !lng) {
      return res.status(400).json({ msg: "lat/lng are required" });
    }

    // 2. استعلام الـ SQL مع إصلاح مشكلة الـ Floating Point باستخدام LEAST
    const query = `
      SELECT 
        pharmacy.Name as pharmacy_name,
        pharmacy.id as pharmacy_id,
        pharmacy.Phone as pharmacy_phaone,
        pharmacy.Rate as pharmacy_rate,
        pharmacy.Location,
        ( 6371 * acos( LEAST(1.0, cos( radians(?) ) 
          * cos( radians( pharmacy.latitude ) ) 
          * cos( radians( pharmacy.longitude ) - radians(?) ) 
          + sin( radians(?) ) 
          * sin( radians( pharmacy.latitude ) ) ) )
        ) AS distance
      FROM pharmacy
      HAVING distance < ?
      ORDER BY distance ASC;
    `;

    // 3. تمرير المتغيرات
    db.execute(query, [lat, lng, lat, radius], (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });

      res.status(200).json({ data: result });
    });

  } catch (error) {
    res.status(500).json({ success: false, msg: error.message, stack: error.stack });
  }
};








// export const home_getall_medicine = (req, res) => {
//  try {
//    const query = `
//     SELECT 
//       medicine.Name,
//       medicine.Id as medicine_id,
//       medicine.Manufacturer,
//       medicine.Category,
//       medicine.Description,
//       pharmacymedicine.Price,
//       pharmacymedicine.Quantity,
//       pharmacy.Name as pharmacy_name,
//       pharmacy.Location
//     FROM medicine
//     JOIN pharmacymedicine 
//       ON pharmacymedicine.MedicineId = medicine.Id
//     JOIN pharmacy 
//       ON pharmacy.Id = pharmacymedicine.PharmacyId;
//   `;

//   db.execute(query, [], (error, result) => {
//     if (error) return res.status(500).json({ msg: error.message });

//     res.status(200).json({ data: result });
//   });

//  } catch (error) {
//       res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

//  }
// };

























///////////////////////////////////////////////////////////////


// export const home_search = (req, res) => {
//  try {
//    const { input } = req.query;

//   if (!input) {
//     return res.status(400).json({ msg: "input is required" });
//   }

//   const query = `
//   SELECT 
//     medicine.Name,
//     medicine.Id as medicine_id,
//     medicine.Manufacturer,
//     medicine.Category,
//     medicine.Description,
//     pharmacymedicine.Price,
//     pharmacymedicine.Quantity,
//     pharmacy.Name as pharmacy_name,
//     pharmacy.Location,
//     pharmacy.Id as pharmcy_id,
//     pharmacy.Phone as pharmcy_phone,
//     pharmacy.Rate,

//     COUNT(comment.Id) as comments_count

//   FROM medicine

//   JOIN pharmacymedicine
//     ON pharmacymedicine.MedicineId = medicine.Id

//   JOIN pharmacy
//     ON pharmacy.Id = pharmacymedicine.PharmacyId

//   LEFT JOIN comment
//     ON comment.Pharmacy_id = pharmacy.Id

//   WHERE medicine.Name LIKE ?

//   GROUP BY 
//     medicine.Id,
//     pharmacy.Id
// `;

//   const values = [`%${input}%`];

//   db.execute(query, values, (error, result) => {
//     if (error) {
//       return res.status(500).json({ msg: error.message });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ msg: "Don't find any medicine" });
//     }

//     return res.status(200).json({ data: result });
//   });
//  } catch (error) {
//       res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

//  }
// };


export const home_search = (req, res) => {
  try {
    const { input } = req.query;

    // 1. استخراج الإحداثيات والتأكد من أنها أرقام صريحة
    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng);
    const radius = parseFloat(req.query.radius) || 10; // النطاق الافتراضي 10 كيلو

    if (!input) {
      return res.status(400).json({ msg: "input is required" });
    }

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ msg: "Valid lat and lng are required" });
    }

    // 2. استعلام الـ SQL المُعدل
    const query = `
      SELECT 
        medicine.Name,
        medicine.Id as medicine_id,
        medicine.Manufacturer,
        medicine.Category,
        medicine.Description,
        pharmacymedicine.Price,
        pharmacymedicine.Quantity,
        pharmacy.Name as pharmacy_name,
        pharmacy.Location,
        pharmacy.Id as pharmcy_id,
        pharmacy.Phone as pharmcy_phone,
        pharmacy.Rate,
        COUNT(comment.Id) as comments_count,
        ( 6371 * acos( LEAST(1.0, cos( radians(?) ) 
          * cos( radians( pharmacy.latitude ) ) 
          * cos( radians( pharmacy.longitude ) - radians(?) ) 
          + sin( radians(?) ) 
          * sin( radians( pharmacy.latitude ) ) ) )
        ) AS distance

      FROM medicine
      JOIN pharmacymedicine 
        ON pharmacymedicine.MedicineId = medicine.Id
      JOIN pharmacy 
        ON pharmacy.Id = pharmacymedicine.PharmacyId
      LEFT JOIN comment 
        ON comment.Pharmacy_id = pharmacy.Id

      WHERE LOWER(medicine.Name) LIKE LOWER(?)

      -- تمت إضافة latitude و longitude هنا لتفادي خطأ ONLY_FULL_GROUP_BY
      GROUP BY 
        medicine.Id,
        medicine.Name,
        medicine.Manufacturer,
        medicine.Category,
        medicine.Description,
        pharmacymedicine.Price,
        pharmacymedicine.Quantity,
        pharmacy.Id,
        pharmacy.Name,
        pharmacy.Location,
        pharmacy.Phone,
        pharmacy.Rate,
        pharmacy.latitude,
        pharmacy.longitude
      
      HAVING distance < ?
      ORDER BY distance ASC
    `;

    // 3. ترتيب القيم الممررة للاستعلام 
    const values = [lat, lng, lat, `%${input}%`, radius];

    db.execute(query, values, (error, result) => {
      if (error) {
        return res.status(500).json({ msg: error.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ msg: "Don't find any medicine" });
      }

      return res.status(200).json({ data: result });
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message, stack: error.stack });
  }
};










///////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////


////////

export const add_comment = (req, res) => {
try {
    const { comment, pharmcy_id } = req.body;
  const {user_data}=req

  const query = `INSERT INTO comment (User_id, Pharmacy_id, Comm) VALUES ( ?, ?, ?)`;
  const values = [user_data.id, pharmcy_id, comment];

  db.execute(query, values, (error, result) => {
    if (error) return res.status(500).json({ msg: error.message });

    res.status(201).json({ msg: "Process Done", data: result });
  });
} catch (error) {
      res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

}
};
////////////////////////////////////////////////////////////////////////////


export const updateComment = async (req, res) => {
  
  try {
    const commentId = req.params.id;
    const {  comment } = req.body;
  const {user_data} =req

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // 1️⃣ تأكد إن الكومنت موجود وبتاع نفس اليوزر
    const [rows] = await db
      .promise()
      .query("SELECT * FROM comment WHERE Id = ? AND User_id = ?", [
        commentId,
        user_data.id,
      ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 2️⃣ update
    await db
      .promise()
      .query("UPDATE comment SET Comm = ? WHERE Id = ?", [comment, commentId]);

    res.json({ message: "Comment updated successfully" });
  } catch (error) {
    res.status(500).json({ success:false,message: error.message , stack :error.stack });
  }
};

///////////////////////////////////////////////////////////////////////////////

export const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const { user_data } = req;

  try {
    // 1️⃣ check ownership
    const [rows] = await db
      .promise()
      .query("SELECT * FROM comment WHERE Id = ? AND User_id = ?", [
        commentId,
        user_data.id,
      ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 2️⃣ delete
    await db.promise().query("DELETE FROM comment WHERE Id = ?", [commentId]);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
      res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

  }
};




























//////////////////////////////////////////////////////////////////

export const add_medicine = (req, res) => {
  try {
    const {user_data} = req
  const { medicine_id, duration_days } = req.body;
 


    const query_check_has_medicine = `
      SELECT medicine.Id
      FROM usermedicine 
      JOIN medicine ON usermedicine.MedicineId = medicine.Id 
      WHERE usermedicine.UserID = ? AND medicine.Id = ?
    `;

    const values = [user_data.id, medicine_id];

    db.execute(query_check_has_medicine, values, (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });

      if (result.length != 0) {
        return res
          .status(400)
          .json({ msg: "This medicine is already in your profile" });
      }

      const query = `
        INSERT INTO usermedicine 
        (MedicineId, UserID, start_date, duration_days, end_date)
        VALUES (?, ?, CURRENT_DATE, ?, DATE_ADD(CURRENT_DATE, INTERVAL ? DAY))
      `;

      const insertValues = [medicine_id, user_data.id, duration_days, duration_days];

      db.execute(query, insertValues, (error, result) => {
        if (error) return res.status(500).json({ msg: error.message });

        if (result.affectedRows != 0) {
          res.status(200).json({
            msg: "Add Medicine Done",
            duration_days,
          });
        } else {
          res.status(500).json({ msg: "Error in adding Medicine" });
        }
      });
    });
  
  } catch (error) {
    res.status(500).json({sucess:false , msg :error.message , stack : error.stack})
  }
};

//////////////////////////////////////////////////////////////////
export const get_medicine_user = (req, res) => {
try {
  const {user_data}=req

  const query = `select usermedicine.MedicineId , usermedicine.start_date ,usermedicine.start_date ,usermedicine.duration_days , usermedicine.end_date , usermedicine.status, medicine.Name , medicine.Manufacturer , medicine.Category , medicine.Description  from usermedicine 
JOIN medicine
ON usermedicine.MedicineId = medicine.Id
WHERE usermedicine.UserID = ?;`;

  const values = [user_data.id];

  db.execute(query, values, (error, result) => {
    if (error) return res.status(500).json({ msg: error.message });

    if (result.length != 0) {
      return res.status(200).json({ message: "medicine Data", data: result });
    } else {
      return res.status(404).json({ message: "medicine  not exist" });
    }
  });
} catch (error) {
    res.status(500).json({sucess:false , msg :error.message , stack : error.stack})
  
}
};

//////////////////////////////////////////////////////////////////

export const del_medicine = (req, res) => {
try {
  
    const { medicine_id } = req.body;
  const {user_data} = req 
  

 
    const query_check_has_medicine = `SELECT medicine.Name FROM medicine JOIN usermedicine ON medicine.Id = usermedicine.MedicineId JOIN users ON users.Id = usermedicine.UserID WHERE usermedicine.UserID = ? AND usermedicine.MedicineId = ?`;
    const values = [user_data.id, medicine_id];

    db.execute(query_check_has_medicine, values, (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });

      if (result.length == 0) {
        res.status(400).json({ msg: "This medicine is not in your profile" });
      } else {
        const query = `DELETE FROM usermedicine WHERE UserID = ? AND MedicineId = ?;`;
        const deleteValues = [user_data.id, medicine_id];
        db.execute(query, deleteValues, (error, result) => {
          if (error) return res.status(500).json({ msg: error.message });
          if (result.affectedRows != 0) {
            res.status(200).json({ msg: "Delete Medicine Done" });
          } else {
            res.status(500).json({ msg: "Error in Deleting Medicine" });
          }
        });
      }
    });
} catch (error) {

        res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

  
}

};


















export const update_status_medicine = (req, res) => {
  try {
    const { medicine_id } = req.body;
  const {user_data}=req



  const query = `
    UPDATE usermedicine
    SET status = CASE 
      WHEN status = 'active' THEN 'inactive'
      ELSE 'active'
    END
    WHERE UserID = ? AND MedicineId = ?
  `;

  db.execute(query, [user_data.id, medicine_id], (error, result) => {
    if (error) return res.status(500).json({ msg: error.message });

    // ✅ مفيش row اتأثر → الدواء مش موجود
    if (result.affectedRows === 0) {
      return res.status(404).json({
        msg: "don't find medicine in user",
      });
    }

    return res.status(200).json({
      msg: "medicine status updated successfully",
    });
  });
  } catch (error) {
          res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

  }
};

//////////////////////////////////////////////////////////////////
export const get_desise_user = (req, res) => {
try {
    const { user_data } = req;

  const query = `SELECT userdiseases.UserId , diseases.Name , userdiseases.DiseaseId 
from userdiseases JOIN diseases 
ON diseases.Id = userdiseases.DiseaseId
WHERE userdiseases.UserId=?`;

  const values = [user_data.id];

  db.execute(query, values, (error, result) => {
    

    if (result.length != 0) {
      res.status(200).json({ message: "diseases Data", data: result });
    } else {
      res.status(404).json({ message: "no diseases exist" });
    }
  });
} catch (error) {
  
        res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

}
};

///////////////////////////////////////////////////////////////////////////

export const add_disease = (req, res) => {
try {
    let {disease } = req.body;
const {user_data} =req

  // 🔥 تنظيف النص
  disease = disease.trim().toLowerCase();

  // 1️⃣ check disease (case insensitive)
  const checkDisease = `
    SELECT Id FROM diseases 
    WHERE LOWER(Name) = LOWER(?)
  `;

  db.execute(checkDisease, [disease], (err, diseaseResult) => {
    if (err) return res.status(500).json({ msg: err.message });

    if (diseaseResult.length > 0) {
      // 🟢 موجود
      const diseaseId = diseaseResult[0].Id;
      linkUserDisease(user_data.id, diseaseId, res);
    } else {
      // 🔵 مش موجود → insert
      const insertDisease = `INSERT INTO diseases (Name) VALUES (?)`;

      db.execute(insertDisease, [disease], (err, insertResult) => {
        // 🔥 لو حصل duplicate (race condition)
        if (err && err.code === "ER_DUP_ENTRY") {
          // نرجع نجيب الـ id
          db.execute(checkDisease, [disease], (err2, result2) => {
            if (err2) return res.status(500).json({ msg: err2.message });

            const diseaseId = result2[0].Id;
            return linkUserDisease(user_data.id, diseaseId, res);
          });
          return;
        }

        if (err) return res.status(500).json({ msg: err.message });

        const diseaseId = insertResult.insertId;
        linkUserDisease(user_data.id, diseaseId, res);
      });
    }
  });
} catch (error) {
        res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

}
};

const linkUserDisease = (user_id, disease_id, res) => {
  const checkRelation = `
    SELECT * FROM userdiseases 
    WHERE UserId = ? AND DiseaseId = ?
  `;

  db.execute(checkRelation, [user_id, disease_id], (err, result) => {
    if (err) return res.status(500).json({ msg: err.message });

    if (result.length > 0) {
      return res.json({ message: "Disease already added" });
    }

    const insertRelation = `
      INSERT INTO userdiseases (UserId, DiseaseId)
      VALUES (?, ?)
    `;

    db.execute(insertRelation, [user_id, disease_id], (err) => {
      if (err) return res.status(500).json({ msg: err.message });

      res.status(201).json({
        message: "Disease added successfully",
      });
    });
  });
};
/////////////////////////////////////////////////////////////////////////////

export const del_disease = (req, res) => {
 try {
   const { disease_id } = req.body;
  const {user_data} =req

  const query = `SELECT userdiseases.UserId , userdiseases.DiseaseId 
from userdiseases 
WHERE userdiseases.UserId=? AND userdiseases.DiseaseId=?;`;

  const values = [user_data.id, disease_id];

  db.execute(query, values, (error, result) => {
    if (result.length == 0) {
      return res
        .status(200)
        .json({ message: "disease don't exist", data: result });
    } else {
      const query_del = `DELETE from userdiseases WHERE userdiseases.UserId=? and userdiseases.DiseaseId =?`;
      const values_del = [user_data.id, disease_id];

      db.execute(query_del, values_del, (error, result) => {
        if (error) return res.status(500).json({ msg: error.message });

        if (result.length != 0) {
          return res
            .status(201)
            .json({ message: "disease delete ", data: result });
        } else {
          return res
            .status(400)
            .json({ message: "error in delete", data: result });
        }
      });
    }
  });
 } catch (error) {
        res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

 }
};

/////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////

export const get_profile_pharmacy = (req, res)=>{

try {
  const {id} = req.params

  if (!id) {
    return res.status(400).json({ message: "Pharmacy ID is required" });
  }

  // 1️⃣ نجيب بيانات الصيدلية
  const pharmacyQuery = `
    SELECT  Name, Email, Phone, Location
    FROM pharmacy
    WHERE Id = ?
  `;

  db.execute(pharmacyQuery, [id], (error, pharmacyResult) => {
    if (error) return res.status(500).json({ msg: error.message });

    if (pharmacyResult.length === 0) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const commentsQuery = `
      SELECT 
        c.Id,
        c.Comm,
        c.User_id,
        u.Name AS user_name
      FROM comment c
      JOIN users u ON c.User_id = u.Id
      WHERE c.Pharmacy_id = ?
      ORDER BY c.Id DESC
    `; 

    db.execute(commentsQuery, [id], (error, commentsResult) => {
      if (error) return res.status(500).json({ msg: error.message });

      // 3️⃣ نرجّع الاتنين مع بعض
      res.json({
        pharmacy: pharmacyResult[0],
        comments: commentsResult
      });
    });
  });
 
} catch (error) {
 res.status(500).json( {sucess:false , msg : error.message , stack :error.stack}) 
}

}

