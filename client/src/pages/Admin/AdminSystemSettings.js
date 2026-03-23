import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:8083/api/v1';

const AdminSystemSettings = () => {
  const [auth] = useAuth();

  // Inject auth header for all axios calls in this component
  useEffect(() => {
    if (auth && auth.token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + auth.token;
    }
  }, [auth]);

  // State for settings
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    ownerTheme: 'blue',
    studentTheme: 'blue',
    canViewInvoice: true,
    canEditProfile: true,
    hasLearningAccess: true
  });

  // State for loading
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({
    maintenance: false,
    ownerTheme: false,
    studentTheme: false,
    viewInvoice: false,
    editProfile: false,
    learningAccess: false
  });

  // Theme colors available
  const themeColors = [
    { value: 'blue', label: 'Blue', bgClass: 'bg-primary' },
    { value: 'green', label: 'Green', bgClass: 'bg-success' },
    { value: 'purple', label: 'Purple', bgClass: 'bg-purple' },
    { value: 'orange', label: 'Orange', bgClass: 'bg-warning' }
  ];

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/settings`);
      if (response.data && response.data.data) {
        const d=response.data.data;setSettings({maintenanceMode:d.maintenanceMode??false,ownerTheme:d.ownerTheme??"blue",studentTheme:d.studentTheme??"blue",canViewInvoice:d.studentControls?.view_invoice??true,canEditProfile:d.studentControls?.edit_profile??true,hasLearningAccess:d.learningControls?.access_courses??true});
      }
      toast.success('Settings loaded successfully');
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(error.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Maintenance Mode
  const toggleMaintenanceMode = async () => {
    try {
      setUpdating(prev => ({ ...prev, maintenance: true }));
      const response = await axios.put(`${API_BASE_URL}/settings/maintenance-mode`);
      setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
      toast.success(
        response.data?.message || 
        `Maintenance mode ${!settings.maintenanceMode ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle maintenance mode');
    } finally {
      setUpdating(prev => ({ ...prev, maintenance: false }));
    }
  };

  // Update Owner Theme
  const updateOwnerTheme = async (theme) => {
    try {
      setUpdating(prev => ({ ...prev, ownerTheme: true }));
      await axios.put(`${API_BASE_URL}/settings/owner-theme`, { theme });
      setSettings(prev => ({ ...prev, ownerTheme: theme }));
      toast.success(`Owner theme updated to ${theme}`);
    } catch (error) {
      console.error('Error updating owner theme:', error);
      toast.error(error.response?.data?.message || 'Failed to update owner theme');
    } finally {
      setUpdating(prev => ({ ...prev, ownerTheme: false }));
    }
  };

  // Update Student Theme
  const updateStudentTheme = async (theme) => {
    try {
      setUpdating(prev => ({ ...prev, studentTheme: true }));
      await axios.put(`${API_BASE_URL}/settings/student-theme`, { theme });
      setSettings(prev => ({ ...prev, studentTheme: theme }));
      toast.success(`Student theme updated to ${theme}`);
    } catch (error) {
      console.error('Error updating student theme:', error);
      toast.error(error.response?.data?.message || 'Failed to update student theme');
    } finally {
      setUpdating(prev => ({ ...prev, studentTheme: false }));
    }
  };

  // Toggle View Invoice
  const toggleViewInvoice = async () => {
    try {
      setUpdating(prev => ({ ...prev, viewInvoice: true }));
      const response = await axios.put(`${API_BASE_URL}/settings/toggle-view-invoice`);
      setSettings(prev => ({ ...prev, canViewInvoice: !prev.canViewInvoice }));
      toast.success(
        response.data?.message || 
        `View invoice ${!settings.canViewInvoice ? 'enabled' : 'disabled'} for students`
      );
    } catch (error) {
      console.error('Error toggling view invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle view invoice');
    } finally {
      setUpdating(prev => ({ ...prev, viewInvoice: false }));
    }
  };

  // Toggle Edit Profile
  const toggleEditProfile = async () => {
    try {
      setUpdating(prev => ({ ...prev, editProfile: true }));
      const response = await axios.put(`${API_BASE_URL}/settings/toggle-edit-profile`);
      setSettings(prev => ({ ...prev, canEditProfile: !prev.canEditProfile }));
      toast.success(
        response.data?.message || 
        `Edit profile ${!settings.canEditProfile ? 'enabled' : 'disabled'} for students`
      );
    } catch (error) {
      console.error('Error toggling edit profile:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle edit profile');
    } finally {
      setUpdating(prev => ({ ...prev, editProfile: false }));
    }
  };

  // Toggle Learning Access
  const toggleLearningAccess = async () => {
    try {
      setUpdating(prev => ({ ...prev, learningAccess: true }));
      const response = await axios.put(`${API_BASE_URL}/settings/toggle-learning-access`);
      setSettings(prev => ({ ...prev, hasLearningAccess: !prev.hasLearningAccess }));
      toast.success(
        response.data?.message || 
        `Learning access ${!settings.hasLearningAccess ? 'enabled' : 'disabled'} for students`
      );
    } catch (error) {
      console.error('Error toggling learning access:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle learning access');
    } finally {
      setUpdating(prev => ({ ...prev, learningAccess: false }));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-2">System Settings</h2>
          <p className="text-muted">Configure global system settings and student controls</p>
        </div>
      </div>

      {/* Global Settings Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="bi bi-gear-fill me-2"></i>Global Settings</h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6 className="mb-2">Maintenance Mode</h6>
                  <p className="text-muted mb-0 small">
                    When enabled, the system will be in maintenance mode and users will not be able to access the application. 
                    Only administrators can access the system during maintenance.
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <div className="form-check form-switch d-inline-block">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="maintenanceToggle"
                      checked={settings.maintenanceMode}
                      onChange={toggleMaintenanceMode}
                      disabled={updating.maintenance}
                      style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                    />
                    <label className="form-check-label ms-2" htmlFor="maintenanceToggle">
                      {updating.maintenance ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <span className={`badge ${settings.maintenanceMode ? 'bg-danger' : 'bg-success'}`}>
                          {settings.maintenanceMode ? 'ON' : 'OFF'}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-palette-fill me-2"></i>Theme Settings</h5>
            </div>
            <div className="card-body">
              {/* Owner Theme */}
              <div className="mb-4 pb-4 border-bottom">
                <h6 className="mb-3">Owner Dashboard Theme</h6>
                <p className="text-muted mb-3 small">
                  Select the color theme for the owner/admin dashboard interface.
                </p>
                <div className="row g-3">
                  {themeColors.map((color) => (
                    <div key={color.value} className="col-6 col-md-3">
                      <button
                        className={`btn w-100 ${
                          settings.ownerTheme === color.value 
                            ? `${color.bgClass} text-white border-3 border-dark` 
                            : `${color.bgClass} text-white opacity-75`
                        }`}
                        onClick={() => updateOwnerTheme(color.value)}
                        disabled={updating.ownerTheme}
                        style={{ minHeight: '60px' }}
                      >
                        {updating.ownerTheme && settings.ownerTheme === color.value ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <>
                            {color.label}
                            {settings.ownerTheme === color.value && (
                              <i className="bi bi-check-circle-fill ms-2"></i>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Theme */}
              <div>
                <h6 className="mb-3">Student Dashboard Theme</h6>
                <p className="text-muted mb-3 small">
                  Select the color theme for the student dashboard interface.
                </p>
                <div className="row g-3">
                  {themeColors.map((color) => (
                    <div key={color.value} className="col-6 col-md-3">
                      <button
                        className={`btn w-100 ${
                          settings.studentTheme === color.value 
                            ? `${color.bgClass} text-white border-3 border-dark` 
                            : `${color.bgClass} text-white opacity-75`
                        }`}
                        onClick={() => updateStudentTheme(color.value)}
                        disabled={updating.studentTheme}
                        style={{ minHeight: '60px' }}
                      >
                        {updating.studentTheme && settings.studentTheme === color.value ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <>
                            {color.label}
                            {settings.studentTheme === color.value && (
                              <i className="bi bi-check-circle-fill ms-2"></i>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Controls Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="bi bi-people-fill me-2"></i>Student Controls</h5>
            </div>
            <div className="card-body">
              {/* View Invoice Toggle */}
              <div className="row align-items-center mb-4 pb-4 border-bottom">
                <div className="col-md-8">
                  <h6 className="mb-2"><i className="bi bi-receipt me-2"></i>View Invoice</h6>
                  <p className="text-muted mb-0 small">
                    Allow students to view their invoices and payment history. When disabled, students will not 
                    be able to access invoice details from their dashboard.
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <div className="form-check form-switch d-inline-block">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="viewInvoiceToggle"
                      checked={settings.canViewInvoice}
                      onChange={toggleViewInvoice}
                      disabled={updating.viewInvoice}
                      style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                    />
                    <label className="form-check-label ms-2" htmlFor="viewInvoiceToggle">
                      {updating.viewInvoice ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <span className={`badge ${settings.canViewInvoice ? 'bg-success' : 'bg-danger'}`}>
                          {settings.canViewInvoice ? 'ON' : 'OFF'}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Edit Profile Toggle */}
              <div className="row align-items-center mb-4 pb-4 border-bottom">
                <div className="col-md-8">
                  <h6 className="mb-2"><i className="bi bi-person-circle me-2"></i>Edit Profile</h6>
                  <p className="text-muted mb-0 small">
                    Allow students to edit their profile information including personal details and contact information. 
                    When disabled, student profiles will be read-only.
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <div className="form-check form-switch d-inline-block">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="editProfileToggle"
                      checked={settings.canEditProfile}
                      onChange={toggleEditProfile}
                      disabled={updating.editProfile}
                      style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                    />
                    <label className="form-check-label ms-2" htmlFor="editProfileToggle">
                      {updating.editProfile ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <span className={`badge ${settings.canEditProfile ? 'bg-success' : 'bg-danger'}`}>
                          {settings.canEditProfile ? 'ON' : 'OFF'}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Learning Access Toggle */}
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6 className="mb-2"><i className="bi bi-book-fill me-2"></i>Learning Access</h6>
                  <p className="text-muted mb-0 small">
                    Grant students access to the learning management system including courses, materials, and resources. 
                    When disabled, the learning section will be hidden from student dashboards.
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <div className="form-check form-switch d-inline-block">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="learningAccessToggle"
                      checked={settings.hasLearningAccess}
                      onChange={toggleLearningAccess}
                      disabled={updating.learningAccess}
                      style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                    />
                    <label className="form-check-label ms-2" htmlFor="learningAccessToggle">
                      {updating.learningAccess ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <span className={`badge ${settings.hasLearningAccess ? 'bg-success' : 'bg-danger'}`}>
                          {settings.hasLearningAccess ? 'ON' : 'OFF'}
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info" role="alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            <strong>Note:</strong> Changes to these settings take effect immediately and will impact all users. 
            Please ensure you understand the implications before making changes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
