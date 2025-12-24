import React, {useState, useEffect, useRef} from 'react';
import {BookOpen, Loader2, Building2, Plus, Edit, Trash2} from 'lucide-react';
import {useI18n} from '../../lib/i18n';
import {SchoolService, School, SchoolClass} from '../../services/SchoolService';
import {ClassService, ClassRequestDTO} from '../../services/ClassService';
import {ApiErrorException} from '../../services/BaseService';
import {ErrorModal} from '../modals/ErrorModal';
import {SuccessModal} from '../modals/SuccessModal';
import {ConfirmDeleteModal} from '../modals/ConfirmDeleteModal';

interface FormData {
    name: string;
    schoolYear: string;
}

interface FormErrors {
    name?: string;
    schoolYear?: string;
}

export function ClassesTab() {
    const {t} = useI18n();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        schoolYear: '',
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const nameInputRef = useRef<HTMLInputElement>(null);
    const schoolYearInputRef = useRef<HTMLInputElement>(null);

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
            setErrorMessage(error instanceof Error ? error.message : t('dashboard.classes.loadError'));
            setErrorDialogOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        const trimmedName = formData.name.trim();
        if (trimmedName.length === 0) {
            errors.name = t('dashboard.classes.validation.nameRequired');
        } else if (trimmedName.length < 3) {
            errors.name = t('dashboard.classes.validation.nameMinLength');
        }

        const trimmedSchoolYear = formData.schoolYear.trim();
        if (trimmedSchoolYear.length === 0) {
            errors.schoolYear = t('dashboard.classes.validation.schoolYearRequired');
        } else {
            const schoolYearRegex = /^\d{2}\/\d{2}$/;
            const isValidFormat = schoolYearRegex.test(trimmedSchoolYear);

            if (isValidFormat) {
                const [firstYear, secondYear] = trimmedSchoolYear.split('/').map(Number);
                if (secondYear !== firstYear + 1) {
                    errors.schoolYear = t('dashboard.classes.validation.schoolYearNotConsecutive');
                }
            } else {
                errors.schoolYear = t('dashboard.classes.validation.schoolYearInvalid');
            }
        }

        setFormErrors(errors);

        // Focus on first field with error
        if (errors.name) {
            nameInputRef.current?.focus();
        } else if (errors.schoolYear) {
            schoolYearInputRef.current?.focus();
        }

        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        // Format schoolYear automatically
        if (field === 'schoolYear') {
            value = value.replaceAll(/[^\d/]/g, '');
            if (value.length === 2 && !value.includes('/')) {
                value = value + '/';
            }
            value = value.substring(0, 5);
        }

        setFormData(prev => ({...prev, [field]: value}));

        if (formErrors[field as keyof FormErrors]) {
            setFormErrors(prev => ({...prev, [field]: undefined}));
        }
    };

    const handleAddClick = (schoolId: number) => {
        setSelectedSchoolId(schoolId);
        setEditingClass(null);
        setFormData({name: '', schoolYear: ''});
        setFormErrors({});
        setShowForm(true);
    };

    const handleEditClick = (classItem: SchoolClass) => {
        setSelectedSchoolId(classItem.schoolId);
        setEditingClass(classItem);
        setFormData({
            name: classItem.name,
            schoolYear: classItem.schoolYear,
        });
        setFormErrors({});
        setShowForm(true);
    };

    const handleDeleteClick = (classItem: SchoolClass) => {
        setClassToDelete(classItem);
        setConfirmDeleteOpen(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingClass(null);
        setSelectedSchoolId(null);
        setFormData({name: '', schoolYear: ''});
        setFormErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!selectedSchoolId) {
            setErrorMessage(t('dashboard.classes.validation.schoolRequired'));
            setErrorDialogOpen(true);
            return;
        }

        setSubmitting(true);

        try {
            const classData: ClassRequestDTO = {
                name: formData.name.trim(),
                schoolYear: formData.schoolYear.trim(),
            };

            if (editingClass) {
                await ClassService.updateClass(editingClass.id, classData);
                setSuccessMessage(t('dashboard.classes.updateSuccess'));
            } else {
                await ClassService.createClass(selectedSchoolId, classData);
                setSuccessMessage(t('dashboard.classes.createSuccess'));
            }

            setSuccessDialogOpen(true);
            setShowForm(false);
            setEditingClass(null);
            setSelectedSchoolId(null);
            setFormData({name: '', schoolYear: ''});
            await fetchSchools();
        } catch (error: unknown) {
            let message = editingClass
                ? t('dashboard.classes.updateError')
                : t('dashboard.classes.createError');

            if (error instanceof ApiErrorException) {
                if (error.apiError.details && Array.isArray(error.apiError.details)) {
                    message = error.apiError.details
                        .map((detail: { field: string; reason: string }) => `${detail.field}: ${detail.reason}`)
                        .join('\n');
                } else {
                    message = error.apiError.detail || error.apiError.description || message;
                }
            } else if (error instanceof Error) {
                message = error.message;
            }

            setErrorMessage(message);
            setErrorDialogOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!classToDelete) return;

        setDeleting(true);
        try {
            await ClassService.deleteClass(classToDelete.id);
            setConfirmDeleteOpen(false);
            setClassToDelete(null);
            setSuccessMessage(t('dashboard.classes.deleteSuccess'));
            setSuccessDialogOpen(true);
            await fetchSchools();
        } catch (error: unknown) {
            setConfirmDeleteOpen(false);
            setClassToDelete(null);
            let message = t('dashboard.classes.deleteError');

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

    const renderClassCard = (classItem: SchoolClass) => (
        <div key={classItem.id} className="school-card class-card">
            <div className="school-card-header">
                <div className="school-card-title-wrapper">
                    <BookOpen size={20}/>
                    <h4 className="school-card-title">{classItem.name}</h4>
                </div>
                <div className="school-card-actions">
                    <button
                        className="school-action-btn edit tooltip-container"
                        onClick={() => handleEditClick(classItem)}
                        disabled={submitting || deleting}
                        data-tooltip={t('dashboard.classes.edit')}
                        aria-label={t('dashboard.classes.edit')}
                    >
                        <Edit size={20}/>
                    </button>
                    <button
                        className="school-action-btn delete tooltip-container"
                        onClick={() => handleDeleteClick(classItem)}
                        disabled={submitting || deleting}
                        data-tooltip={t('dashboard.classes.delete')}
                        aria-label={t('dashboard.classes.delete')}
                    >
                        <Trash2 size={20}/>
                    </button>
                </div>
            </div>
            <div className="school-card-body">
                <p className="school-card-detail">
                    <span className="school-card-label">{t('dashboard.classes.schoolYear')}:</span>
                    <span className="school-card-value">{classItem.schoolYear}</span>
                </p>
            </div>
        </div>
    );

    const renderSchoolSection = (school: School) => (
        <div key={school.id} className="school-section">
            {/* School Header */}
            <div className="school-section-header">
                <div className="school-section-header-left">
                    <Building2 size={20} className="school-section-icon"/>
                    <h3 className="school-section-title">{school.name}</h3>
                    {school.town && (
                        <span className="school-section-town">({school.town})</span>
                    )}
                </div>
                <button
                    className="dashboard-add-btn"
                    onClick={() => handleAddClick(school.id)}
                    disabled={submitting || deleting}
                >
                    <Plus size={16} style={{marginRight: '0.5rem'}}/>
                    {t('dashboard.classes.addClass')}
                </button>
            </div>

            {/* Classes Grid or Empty State */}
            {school.classes && school.classes.length > 0 ? (
                <div className="schools-grid">
                    {school.classes.map((classItem: SchoolClass) => renderClassCard(classItem))}
                </div>
            ) : (
                <div className="school-section-empty">
                    <p className="school-section-empty-text">
                        {t('dashboard.classes.noClassesInSchool')}
                    </p>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
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
                    <BookOpen className="dashboard-empty-icon"/>
                    <p className="dashboard-empty-text">{t('dashboard.classes.noClasses')}</p>
                </div>
            );
        }

        return (
            <div className="classes-container">
                {schools.map((school) => renderSchoolSection(school))}
            </div>
        );
    };

    return (
        <div className="dashboard-card">
            {renderContent()}

            {/* Form Modal */}
            {showForm && (
                <dialog className="modal-overlay" open={showForm}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                        <div className="modal-content">
                            <h3 className="modal-title">
                                {editingClass ? t('dashboard.classes.editTitle') : t('dashboard.classes.createTitle')}
                            </h3>
                            <form onSubmit={handleSubmit} className="modal-body">
                                <div>
                                    <label className="login-label">
                                        {t('dashboard.classes.name')} <span className="form-required-asterisk">*</span>
                                    </label>
                                    <input
                                        ref={nameInputRef}
                                        id="name"
                                        className={`modal-input ${formErrors.name ? 'input-error' : ''}`}
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={t('dashboard.classes.namePlaceholder')}
                                        disabled={submitting}
                                    />
                                    {formErrors.name && (
                                        <p className="form-error-text">{formErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="login-label">
                                        {t('dashboard.classes.schoolYear')} <span
                                        className="form-required-asterisk">*</span>
                                    </label>
                                    <input
                                        ref={schoolYearInputRef}
                                        id="schoolYear"
                                        className={`modal-input ${formErrors.schoolYear ? 'input-error' : ''}`}
                                        value={formData.schoolYear}
                                        onChange={(e) => handleInputChange('schoolYear', e.target.value)}
                                        placeholder={t('dashboard.classes.schoolYearPlaceholder')}
                                        disabled={submitting}
                                        maxLength={5}
                                    />
                                    {formErrors.schoolYear && (
                                        <p className="form-error-text">{formErrors.schoolYear}</p>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="modal-button cancel"
                                        onClick={handleCancel}
                                        disabled={submitting}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="modal-button save button-with-icon"
                                        disabled={submitting}
                                    >
                                        {submitting && <Loader2 size={16} className="icon-spin icon-margin-right"/>}
                                        {editingClass ? t('dashboard.classes.update') : t('dashboard.classes.create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </dialog>
            )}

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
                itemName={classToDelete?.name || ''}
                title={t('dashboard.classes.deleteTitle')}
                confirmMessage={t('dashboard.classes.deleteConfirm')}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setConfirmDeleteOpen(false);
                    setClassToDelete(null);
                }}
                isDeleting={deleting}
            />
        </div>
    );
}
