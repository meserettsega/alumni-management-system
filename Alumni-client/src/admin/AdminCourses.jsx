import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState({
    course: '',
    id: ''
  });

  useEffect(() => {
    axios.get(`${baseUrl}auth/courses`)
      .then((res) => {
        setCourses(res.data);
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        toast.error('Error fetching courses');
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}auth/courses/${id}`);
      toast.warning(response.data.message);
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('An error occurred while deleting the course');
    }
  };

  const handleInput = (cname, cid) => {
    setName({
      course: cname,
      id: cid
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (name.id) {
        // If id exists, it's an update operation
        const res = await axios.put(`${baseUrl}auth/courses`, name);
        toast.success('Course updated successfully');
        setCourses(prevCourses => {
          const updatedCourses = prevCourses.map(course => {
            if (course.id === name.id) {
              return { id: name.id, course: name.course };
            }
            return course;
          });
          return updatedCourses;
        });
      } else {
        const res = await axios.post(`${baseUrl}auth/courses`, { course: name.course });
        toast.success('Course saved successfully');
        const newCourse = { id: res.data, course: name.course };
        setCourses([...courses, newCourse]);
      }
      setName({ course: '', id: '' }); // Reset the input fields
    } catch (error) {
      console.error('Error saving/updating course:', error);
      toast.error('An error occurred while saving/updating the course');
    }
  };

  return (
    <div className="container-fluid">
      <ToastContainer position="top-center" />
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-4">
            <form onSubmit={handleSubmit}>
              <div className="card">
                <div className="card-header">
                Department Form
                </div>
                <div className="card-body">
                  <input type="hidden" name="id" />
                  <div className="form-group">
                    <label className="control-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      name="course"
                      value={name.course}
                      onChange={(e) => setName({ ...name, course: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="card-footer">
                  <div className="row">
                    <div className="col-md-6">
                      <button
                        type="submit"
                        className="btn btn-sm btn-primary btn-block"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <b>Department List</b>
              </div>
              <div className="card-body">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th className="text-center">Department</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{c.course}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-primary mr-2 edit_gallery"
                            type="button"
                            onClick={() => handleInput(c.course, c.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger delete_gallery"
                            type="button"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;