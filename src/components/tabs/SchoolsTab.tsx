import React, {useState, useEffect} from 'react';
import {Building2, Plus, Loader2, Trash2, Edit} from 'lucide-react';
import {useI18n} from '../../lib/i18n';
import {SchoolService, School, SchoolRequestDTO} from '../../services/SchoolService';
import {ApiErrorException} from '../../services/BaseService';
import {ErrorModal} from '../modals/ErrorModal';
import {SuccessModal} from '../modals/SuccessModal';
import {ConfirmDeleteModal} from '../modals/ConfirmDeleteModal';

interface FormData {
    name: string;
    town: string;
    tlf: string;
}

interface FormErrors {
    name?: string;
    tlf?: string;
}


export function SchoolsTab() {
    const {t} = useI18n();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        town: '',
        tlf: '',
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState('');


    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const schoolData = await SchoolService.getSchools();
            setSchools(schoolData);
        } catch (error) {
            console.error('Error fetching schools:', error);
            setErrorMessage(error instanceof Error ? error.message : t('dashboard.schools.createError'));
            setErrorDialogOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.name.trim()) {
            errors.name = t('dashboard.schools.validation.nameRequired');
        } else if (formData.name.trim().length < 5) {
            errors.name = t('dashboard.schools.validation.nameMinLength');
        }
        if (formData.tlf.trim()) {
            const phoneRegex = /^\d{9}$/;
            if (!phoneRegex.test(formData.tlf.trim())) {
                errors.tlf = t('dashboard.schools.validation.phoneInvalid');
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        if (formErrors[field as keyof FormErrors]) {
            setFormErrors(prev => ({...prev, [field]: undefined}));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const requestData: SchoolRequestDTO = {
                name: formData.name.trim(),
            };

            if (formData.town.trim()) {
                requestData.town = formData.town.trim();
            }

            if (formData.tlf.trim()) {
                requestData.tlf = Number.parseInt(formData.tlf.trim(), 10);
            }

            if (editingSchool) {
                await SchoolService.updateSchool(editingSchool.id, requestData);
                setSuccessMessage(t('dashboard.schools.updateSuccess'));
            } else {
                await SchoolService.createSchool(requestData);
                setSuccessMessage(t('dashboard.schools.createSuccess'));
            }

            setFormData({name: '', town: '', tlf: ''});
            setShowForm(false);
            setEditingSchool(null);
            setSuccessDialogOpen(true);

            await fetchSchools();
        } catch (error) {
            console.error('Error creating/updating school:', error);
            const errorKey = editingSchool ? 'dashboard.schools.updateError' : 'dashboard.schools.createError';
            setErrorMessage(error instanceof Error ? error.message : t(errorKey));
            setErrorDialogOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({name: '', town: '', tlf: ''});
        setFormErrors({});
        setShowForm(false);
        setEditingSchool(null);
    };

    const handleEditClick = (school: School) => {
        setEditingSchool(school);
        setFormData({
            name: school.name,
            town: school.town || '',
            tlf: school.tlf ? String(school.tlf) : '',
        });
        setShowForm(true);
    };

    const handleDeleteClick = (school: School) => {
        setSchoolToDelete(school);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!schoolToDelete) return;
        setDeleting(true);
        try {
            await SchoolService.deleteSchool(schoolToDelete.id);
            setConfirmDeleteOpen(false);
            setSchoolToDelete(null);
            await fetchSchools();
        } catch (error: unknown) {
            console.log('ERROR JSON AL ELIMINAR COLEGIO:', error);
            setConfirmDeleteOpen(false);
            setSchoolToDelete(null);
            let message = t('dashboard.schools.deleteError');
            if (error instanceof ApiErrorException) {
                message = error.apiError.detail || error.apiError.description || error.apiError.code;
            } else if (error instanceof Error) {
                message = error.message;
            }
            setErrorMessage(message);
            setErrorDialogOpen(true);
        } finally {
            setDeleting(false);
        }
    };

    const renderSchoolList = () => {
        if (loading) {
            return (
                <div className="loading-center">
                    <Loader2 className="icon-spin" size={32}/>
                </div>
            );
        }

        if (schools.length === 0) {
            return (
                <div className="dashboard-empty">
                    <Building2 className="dashboard-empty-icon"/>
                    <p className="dashboard-empty-text">{t('dashboard.schools.noSchools')}</p>
                </div>
            );
        }

        return (
            <div className="schools-grid">
                {schools.map((school) => (
                    <div key={school.id} className="school-card">
                        <div className="school-card-header">
                            <div className="school-card-title-wrapper">
                                <Building2 size={20}/>
                                <h4 className="school-card-title">{school.name}</h4>
                            </div>
                            <div className="school-card-actions">
                                <button
                                    className="school-action-btn edit"
                                    onClick={() => handleEditClick(school)}
                                    disabled={deleting}
                                    title={t('dashboard.schools.edit')}
                                    aria-label={t('dashboard.schools.edit')}
                                >
                                    <Edit size={20}/>
                                </button>
                                <button
                                    className="school-action-btn delete"
                                    onClick={() => handleDeleteClick(school)}
                                    disabled={deleting}
                                    title={t('dashboard.schools.delete')}
                                    aria-label={t('dashboard.schools.delete')}
                                >
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        </div>
                        <div className="school-card-details">
                            {Boolean(school.town) && (
                                <p className="school-detail-item">
                                    <span
                                        className="school-detail-label">{t('dashboard.schools.town')}:</span> {school.town}
                                </p>
                            )}
                            {Boolean(school.tlf) && (
                                <p className="school-detail-item">
                                    <span
                                        className="school-detail-label">{t('dashboard.schools.phone')}:</span> {school.tlf}
                                </p>
                            )}
                            <p>
                                <span
                                    className="school-detail-label">{t('dashboard.tabs.classes')}:</span> {school.classes.length}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard-card">
            {/* Header */}
            <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">{t('dashboard.schools.title')}</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="dashboard-add-btn"
                    disabled={loading || submitting}
                >
                    <Plus size={16} className="icon-margin-right"/>
                    {t('dashboard.schools.addNew')}
                </button>
            </div>

            {/* Formulario de creación/edición */}
            {showForm && (
                <div className="modal-content form-inline-expanded">
                    <h3 className="modal-title">
                        {editingSchool ? t('dashboard.schools.editTitle') : t('dashboard.schools.addNew')}
                    </h3>
                    <form onSubmit={handleSubmit} className="modal-body">
                        <div>
                            <label className="login-label">
                                {t('dashboard.schools.name')} <span className="form-required-asterisk">*</span>
                            </label>
                            <input
                                id="name"
                                className="modal-input"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder={t('dashboard.schools.namePlaceholder')}
                                disabled={submitting}
                            />
                            {formErrors.name && (
                                <p className="form-error-text">
                                    {formErrors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="login-label">{t('dashboard.schools.town')}</label>
                            <input
                                id="town"
                                className="modal-input"
                                value={formData.town}
                                onChange={(e) => handleInputChange('town', e.target.value)}
                                placeholder={t('dashboard.schools.townPlaceholder')}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <label className="login-label">{t('dashboard.schools.phone')}</label>
                            <input
                                id="tlf"
                                type="text"
                                inputMode="numeric"
                                className="modal-input"
                                value={formData.tlf}
                                onChange={(e) => handleInputChange('tlf', e.target.value)}
                                placeholder={t('dashboard.schools.phonePlaceholder')}
                                disabled={submitting}
                                maxLength={9}
                            />
                            {formErrors.tlf && (
                                <p className="form-error-text">
                                    {formErrors.tlf}
                                </p>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="modal-button cancel"
                                onClick={handleCancel}
                                disabled={submitting}
                            >
                                {t('dashboard.schools.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="modal-button save button-with-icon"
                                disabled={submitting}
                            >
                                {submitting &&
                                    <Loader2 size={16} className="icon-spin icon-margin-right"/>}
                                {editingSchool ? t('dashboard.schools.update') : t('dashboard.schools.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {renderSchoolList()}

            <ErrorModal
                isOpen={errorDialogOpen}
                message={errorMessage}
                onClose={() => setErrorDialogOpen(false)}
            />

            <SuccessModal
                isOpen={successDialogOpen}
                message={successMessage}
                onClose={() => setSuccessDialogOpen(false)}
            />

            <ConfirmDeleteModal
                isOpen={confirmDeleteOpen}
                itemName={schoolToDelete?.name || ''}
                title={t('dashboard.schools.deleteTitle')}
                confirmMessage={t('dashboard.schools.deleteConfirm')}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteOpen(false)}
                isDeleting={deleting}
            />
        </div>
    );
}
