import { useState, useCallback, useRef } from 'react';
import {
  Database, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  Clock, RefreshCw, Download, Eye, History, RotateCcw, Search, ChevronLeft,
  ChevronRight, Trash2, FileUp, BarChart3, Cpu, Activity, SearchCode, Zap,
  Shield,   FileText, ArrowUpCircle, Info, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePark } from '../context/ParkContext';

const VALID_COLUMNS = [
  'date', 'species', 'location', 'latitude', 'longitude',
  'conflict_type', 'severity', 'crop_damage', 'livestock_loss',
  'human_injury', 'response_team', 'status'
];

const REQUIRED_COLUMNS = ['date', 'species', 'location', 'latitude', 'longitude', 'conflict_type'];

const PROCESSING_STEPS = [
  { key: 'uploading', label: 'Uploading Dataset', icon: FileUp, color: '#3b82f6' },
  { key: 'validating', label: 'Validating Records', icon: SearchCode, color: '#f59e0b' },
  { key: 'cleaning', label: 'Cleaning Data', icon: RefreshCw, color: '#8b5cf6' },
  { key: 'updating', label: 'Updating Wildlife Database', icon: Database, color: '#10b981' },
  { key: 'retraining', label: 'Retraining AI Prediction Model', icon: Cpu, color: '#ec4899' },
  { key: 'refreshing', label: 'Refreshing Dashboard Analytics', icon: BarChart3, color: '#06b6d4' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: '#10b981' },
];

const INITIAL_HISTORY = [
  { id: 1, name: 'kaziranga_conflicts_2024.csv', date: '2025-06-15', uploadedBy: 'Dr. Arjun Sharma', records: 12847, version: '3.2', status: 'Active' },
  { id: 2, name: 'wildlife_census_q1.xlsx', date: '2025-05-28', uploadedBy: 'Ranger Priya Das', records: 8432, version: '2.1', status: 'Active' },
  { id: 3, name: 'elephant_corridor_data.csv', date: '2025-05-10', uploadedBy: 'Dr. Arjun Sharma', records: 5621, version: '1.4', status: 'Superseded' },
  { id: 4, name: 'rhino_sighting_log.xlsx', date: '2025-04-22', uploadedBy: 'Ranger Priya Das', records: 3298, version: '2.0', status: 'Active' },
  { id: 5, name: 'flood_impact_dataset.csv', date: '2025-04-01', uploadedBy: 'Admin', records: 9102, version: '1.0', status: 'Archived' },
  { id: 6, name: 'human_encounters_2024.csv', date: '2025-03-18', uploadedBy: 'Dr. Arjun Sharma', records: 6734, version: '1.8', status: 'Superseded' },
];

const SAMPLE_CSV = `date,species,location,latitude,longitude,conflict_type,severity,crop_damage,livestock_loss,human_injury,response_team,status
2025-01-15,Wild Elephant,Kaziranga West,26.6500,93.4100,Crop Raiding,High,Yes,No,No,Alpha Team,Resolved
2025-01-18,Indian Rhinoceros,Kaziranga North,26.7200,93.3500,Corridor Blockage,Medium,No,No,No,Beta Team,Open
2025-01-20,Wild Buffalo,Kaziranga East,26.6800,93.5200,Livestock Attack,Critical,No,Yes,Yes,Alpha Team,In Progress`;

const ITEMS_PER_PAGE = 5;

const DatasetManagement = () => {
  const { selectedPark } = usePark();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);
  const [processingStep, setProcessingStep] = useState(-1);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [successSummary, setSuccessSummary] = useState(null);
  const [uploadHistory, setUploadHistory] = useState(INITIAL_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('All');
  const fileInputRef = useRef(null);

  const filteredHistory = uploadHistory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = historyFilter === 'All' || item.status === historyFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const simulateValidation = useCallback((file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const isCSV = ext === 'csv';
    const isExcel = ext === 'xlsx' || ext === 'xls';
    const validType = isCSV || isExcel;

    const missingValues = Math.floor(Math.random() * 25) + 3;
    const duplicateRows = Math.floor(Math.random() * 15) + 1;
    const invalidFormats = Math.floor(Math.random() * 8);
    const totalRecords = Math.floor(Math.random() * 8000) + 500;
    const detectedColumns = validType
      ? REQUIRED_COLUMNS.slice(0, Math.floor(Math.random() * 2) + REQUIRED_COLUMNS.length)
      : [];

    const speciesDetected = ['Asian Elephant', 'Indian Rhinoceros', 'Wild Buffalo', 'Tiger', 'Leopard', 'Sambar Deer', 'Wild Boar']
      .slice(0, Math.floor(Math.random() * 5) + 2);

    const missingColumns = validType
      ? VALID_COLUMNS.filter(c => !detectedColumns.includes(c) && REQUIRED_COLUMNS.includes(c))
      : REQUIRED_COLUMNS;

    const results = {
      fileType: { valid: validType, detected: `.${ext.toUpperCase()}` },
      requiredColumns: {
        found: detectedColumns.filter(c => REQUIRED_COLUMNS.includes(c)),
        missing: missingColumns.filter(c => REQUIRED_COLUMNS.includes(c)),
      },
      missingValues,
      duplicateRows,
      invalidFormats,
      totalRecords,
      speciesDetected,
      overallValid: validType && missingColumns.length === 0,
    };

    const stats = {
      totalRecords,
      speciesDetected: speciesDetected.length,
      speciesList: speciesDetected,
      dateRange: 'Jan 2024 – Jun 2025',
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      uploadDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}`,
      lastUpdated: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      validationStatus: validType && missingColumns.length === 0 ? 'Passed' : 'Issues Found',
    };

    return { results, stats };
  }, []);

  const processFile = useCallback((file) => {
    setUploadedFile(file);
    setValidationResults(null);
    setDatasetStats(null);
    setProcessingStep(-1);
    setProcessingProgress(0);
    setProcessingComplete(false);
    setSuccessSummary(null);

    const { results, stats } = simulateValidation(file);
    setValidationResults(results);
    setDatasetStats(stats);

    if (!results.overallValid) {
      toast.error('Dataset validation found critical issues. Please review.', {
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
      });
    } else {
      toast.success('Dataset validated successfully!', {
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
      });
    }
  }, [simulateValidation]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const startProcessing = useCallback(() => {
    if (!uploadedFile || !validationResults?.overallValid) {
      toast.error('Please upload a valid dataset first.', {
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
      });
      return;
    }
    setShowConfirmDialog(true);
  }, [uploadedFile, validationResults]);

  const executeProcessing = useCallback(() => {
    setShowConfirmDialog(false);
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingProgress(0);

    let step = 0;
    const stepDurations = [1200, 1800, 1500, 2000, 2500, 1500, 500];

    const advanceStep = () => {
      if (step < PROCESSING_STEPS.length) {
        setProcessingStep(step);
        const duration = stepDurations[step];
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 50;
          const baseProgress = (step / PROCESSING_STEPS.length) * 100;
          const stepContribution = (elapsed / duration) * (100 / PROCESSING_STEPS.length);
          setProcessingProgress(Math.min(baseProgress + stepContribution, 100));
          if (elapsed >= duration) {
            clearInterval(interval);
            step++;
            advanceStep();
          }
        }, 50);
      } else {
        setProcessingProgress(100);
        setIsProcessing(false);
        setProcessingComplete(true);
        setSuccessSummary({
          newRecords: datasetStats?.totalRecords || 0,
          duplicatesRemoved: validationResults?.duplicateRows || 0,
          invalidRowsSkipped: (validationResults?.missingValues || 0) + (validationResults?.invalidFormats || 0),
          predictionUpdated: true,
          analyticsRefreshed: true,
        });

        const newEntry = {
          id: Date.now(),
          name: uploadedFile.name,
          date: new Date().toISOString().split('T')[0],
          uploadedBy: 'Admin',
          records: datasetStats?.totalRecords || 0,
          version: datasetStats?.version || '1.0',
          status: 'Active',
        };
        setUploadHistory(prev => [newEntry, ...prev.map(h => ({ ...h, status: h.status === 'Active' ? 'Superseded' : h.status }))]);

        toast.success('Dataset processing complete!', {
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        });
      }
    };

    advanceStep();
  }, [uploadedFile, datasetStats, validationResults]);

  const handleDownloadSample = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaziranga_sample_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample template downloaded!', {
      style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
    });
  }, []);

  const handleRollback = useCallback(() => {
    setShowRollbackDialog(false);
    setUploadedFile(null);
    setValidationResults(null);
    setDatasetStats(null);
    setProcessingStep(-1);
    setProcessingProgress(0);
    setIsProcessing(false);
    setProcessingComplete(false);
    setSuccessSummary(null);
    if (uploadHistory.length > 1) {
      setUploadHistory(prev => prev.slice(1));
    }
    toast.success('Rolled back to previous dataset.', {
      style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
      iconTheme: { primary: '#f59e0b', secondary: '#fff' },
    });
  }, [uploadHistory]);

  const resetUpload = useCallback(() => {
    setUploadedFile(null);
    setValidationResults(null);
    setDatasetStats(null);
    setProcessingStep(-1);
    setProcessingProgress(0);
    setIsProcessing(false);
    setProcessingComplete(false);
    setSuccessSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const getStepStatus = (index) => {
    if (processingComplete) return 'completed';
    if (index < processingStep) return 'completed';
    if (index === processingStep) return 'active';
    return 'pending';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* PAGE HEADER */}
      <div className="animate-slide-up" style={{ marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#f1f5f9', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database color="#8b5cf6" size={26} /> Dataset Management
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
          Upload, validate, and manage wildlife conflict datasets to keep the prediction engine current.
        </p>
      </div>

      {/* UPLOAD SECTION */}
      <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

        {/* LEFT: Drag & Drop Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className="hover-elevate"
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '14px',
            border: `2px dashed ${isDragging ? '#8b5cf6' : '#334155'}`,
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '220px',
            position: 'relative',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: isDragging ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}>
            <Upload size={28} color={isDragging ? '#8b5cf6' : '#94a3b8'} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>
              {isDragging ? 'Drop your dataset here' : 'Drag & drop your dataset'}
            </p>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              or click to browse — supports CSV and Excel (.xlsx)
            </p>
          </div>
          {uploadedFile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', borderRadius: '10px',
              backgroundColor: '#0f172a', border: '1px solid #334155',
              marginTop: '8px', width: 'fit-content',
            }}>
              <FileSpreadsheet size={18} color="#10b981" />
              <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>{uploadedFile.name}</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>• {(uploadedFile.size / 1024).toFixed(1)} KB</span>
              {!isProcessing && (
                <button
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                >
                  <X size={14} color="#ef4444" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Validation Results */}
        <div style={{
          backgroundColor: '#1e293b', borderRadius: '14px',
          border: '1px solid #334155', padding: '24px',
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#f1f5f9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SearchCode size={18} color="#f59e0b" /> Validation Results
          </h3>
          {validationResults ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              {/* File Type */}
              <ValidationCard
                label="File Type"
                value={validationResults.fileType.detected}
                passed={validationResults.fileType.valid}
              />
              {/* Required Columns */}
              <ValidationCard
                label="Required Columns"
                value={`${validationResults.requiredColumns.found.length}/${REQUIRED_COLUMNS.length} found`}
                passed={validationResults.requiredColumns.missing.length === 0}
                detail={validationResults.requiredColumns.missing.length > 0 ? `Missing: ${validationResults.requiredColumns.missing.join(', ')}` : null}
              />
              {/* Missing Values */}
              <ValidationCard
                label="Missing Values"
                value={`${validationResults.missingValues} rows`}
                passed={validationResults.missingValues < 10}
              />
              {/* Duplicates */}
              <ValidationCard
                label="Duplicate Records"
                value={`${validationResults.duplicateRows} found`}
                passed={validationResults.duplicateRows < 5}
              />
              {/* Invalid Formats */}
              <ValidationCard
                label="Format Issues"
                value={`${validationResults.invalidFormats} rows`}
                passed={validationResults.invalidFormats === 0}
              />
              {/* Overall */}
              <div style={{
                gridColumn: 'span 2',
                padding: '14px', borderRadius: '10px',
                backgroundColor: validationResults.overallValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${validationResults.overallValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                {validationResults.overallValid ? <CheckCircle2 size={18} color="#10b981" /> : <AlertTriangle size={18} color="#ef4444" />}
                <span style={{ fontSize: '13px', fontWeight: 600, color: validationResults.overallValid ? '#10b981' : '#ef4444' }}>
                  {validationResults.overallValid ? 'Dataset is ready for processing' : 'Issues detected — please review before processing'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
              <FileText size={40} />
              <p style={{ margin: 0, fontSize: '14px' }}>Upload a file to see validation results</p>
            </div>
          )}
        </div>
      </div>

      {/* DATASET STATISTICS */}
      {datasetStats && (
        <div className="stagger-children animate-slide-up" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '24px',
        }}>
          <StatCard icon={FileSpreadsheet} label="Total Records" value={datasetStats.totalRecords.toLocaleString()} color="#3b82f6" />
          <StatCard icon={Activity} label="Species Detected" value={datasetStats.speciesDetected} color="#10b981" />
          <StatCard icon={Clock} label="Date Range" value={datasetStats.dateRange} color="#8b5cf6" />
          <StatCard icon={Info} label="File Size" value={datasetStats.fileSize} color="#f59e0b" />
          <StatCard icon={ArrowUpCircle} label="Upload Date" value={datasetStats.uploadDate} color="#ec4899" />
          <StatCard icon={Shield} label="Version" value={`v${datasetStats.version}`} color="#06b6d4" />
          <StatCard icon={RefreshCw} label="Last Updated" value={datasetStats.lastUpdated} color="#8b5cf6" />
          <StatCard icon={CheckCircle2} label="Validation" value={datasetStats.validationStatus} color={datasetStats.validationStatus === 'Passed' ? '#10b981' : '#f59e0b'} />
        </div>
      )}

      {/* PROCESSING SECTION */}
      {uploadedFile && validationResults && (
        <div className="animate-slide-up" style={{
          backgroundColor: '#1e293b', borderRadius: '14px',
          border: '1px solid #334155', padding: '24px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#f1f5f9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" /> Processing Pipeline
            </h3>
            {!isProcessing && !processingComplete && (
              <button onClick={startProcessing} className="btn-glow" style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: 700, fontSize: '13px',
                boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Zap size={14} /> Start Processing
              </button>
            )}
            {processingComplete && (
              <button onClick={resetUpload} className="btn-glow" style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', fontWeight: 700, fontSize: '13px',
                boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Upload size={14} /> Upload New Dataset
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {(isProcessing || processingComplete) && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Progress</span>
                <span style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 600 }}>{Math.round(processingProgress)}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${processingProgress}%`, height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)',
                  borderRadius: '3px', transition: 'width 0.1s linear',
                }} />
              </div>
            </div>
          )}

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PROCESSING_STEPS.map((step, idx) => {
              const status = getStepStatus(idx);
              const StepIcon = step.icon;
              return (
                <div key={step.key} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: '10px',
                  backgroundColor: status === 'active' ? `${step.color}10` : 'transparent',
                  border: status === 'active' ? `1px solid ${step.color}30` : '1px solid transparent',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: status === 'completed' ? `${step.color}20` : status === 'active' ? `${step.color}20` : '#0f172a',
                    border: `2px solid ${status === 'completed' ? step.color : status === 'active' ? step.color : '#334155'}`,
                  }}>
                    {status === 'completed' ? (
                      <CheckCircle2 size={16} color={step.color} />
                    ) : status === 'active' ? (
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        backgroundColor: step.color, animation: 'pulseGlow 1.5s ease-in-out infinite',
                      }} />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{idx + 1}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <StepIcon size={16} color={status === 'completed' ? step.color : status === 'active' ? step.color : '#64748b'} />
                    <span style={{
                      fontSize: '13px', fontWeight: status === 'active' ? 600 : 500,
                      color: status === 'completed' ? step.color : status === 'active' ? '#f1f5f9' : '#64748b',
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {status === 'completed' && (
                    <span style={{ fontSize: '11px', color: step.color, fontWeight: 600 }}>Done</span>
                  )}
                  {status === 'active' && isProcessing && (
                    <div style={{
                      width: '16px', height: '16px', border: '2px solid #334155',
                      borderTop: `2px solid ${step.color}`, borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUCCESS SUMMARY */}
      {processingComplete && successSummary && (
        <div className="animate-slide-up" style={{
          backgroundColor: '#1e293b', borderRadius: '14px',
          border: '1px solid rgba(16, 185, 129, 0.3)', padding: '24px', marginBottom: '24px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> Processing Complete
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <SuccessStat label="New Records Added" value={successSummary.newRecords.toLocaleString()} color="#10b981" />
            <SuccessStat label="Duplicates Removed" value={successSummary.duplicatesRemoved} color="#f59e0b" />
            <SuccessStat label="Invalid Rows Skipped" value={successSummary.invalidRowsSkipped} color="#ef4444" />
            <SuccessStat label="Prediction Model" value={successSummary.predictionUpdated ? 'Updated' : 'Pending'} color="#8b5cf6" />
            <SuccessStat label="Analytics Engine" value={successSummary.analyticsRefreshed ? 'Refreshed' : 'Pending'} color="#3b82f6" />
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className="animate-slide-up" style={{
        backgroundColor: '#1e293b', borderRadius: '14px',
        border: '1px solid #334155', padding: '24px', marginBottom: '24px',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#f1f5f9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="#f59e0b" /> Quick Actions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <QuickAction icon={Upload} label="Upload New Dataset" color="#3b82f6" onClick={() => fileInputRef.current?.click()} />
          <QuickAction icon={SearchCode} label="Validate Dataset" color="#f59e0b" onClick={() => {
            if (uploadedFile) { processFile(uploadedFile); } else { toast('Upload a file first.', { icon: 'ℹ️', style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }); }
          }} />
          <QuickAction icon={Cpu} label="Retrain AI Model" color="#8b5cf6" onClick={() => {
            toast('AI model retraining initiated in background.', { style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } });
          }} />
          <QuickAction icon={Eye} label="Preview Dataset" color="#06b6d4" onClick={() => {
            if (uploadedFile) { setShowPreview(true); } else { toast('Upload a file first.', { icon: 'ℹ️', style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }); }
          }} />
          <QuickAction icon={Download} label="Download Sample Template" color="#10b981" onClick={handleDownloadSample} />
          <QuickAction icon={History} label="View Upload History" color="#ec4899" onClick={() => {
            document.getElementById('upload-history')?.scrollIntoView({ behavior: 'smooth' });
          }} />
          <QuickAction icon={RotateCcw} label="Rollback Previous Dataset" color="#ef4444" onClick={() => setShowRollbackDialog(true)} />
        </div>
      </div>

      {/* UPLOAD HISTORY */}
      <div id="upload-history" className="animate-slide-up" style={{
        backgroundColor: '#1e293b', borderRadius: '14px',
        border: '1px solid #334155', padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#f1f5f9', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#ec4899" /> Upload History
          </h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '10px',
              backgroundColor: '#0f172a', border: '1px solid #334155',
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="input-transition"
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: '#f1f5f9', fontSize: '13px', width: '160px',
                }}
              />
            </div>
            <select
              value={historyFilter}
              onChange={(e) => { setHistoryFilter(e.target.value); setCurrentPage(1); }}
              className="input-transition"
              style={{
                padding: '8px 12px', borderRadius: '10px',
                border: '1px solid #334155', backgroundColor: '#0f172a',
                color: '#f1f5f9', fontSize: '13px', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Superseded">Superseded</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Dataset Name', 'Upload Date', 'Uploaded By', 'Records', 'Version', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.length > 0 ? paginatedHistory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px 14px', color: '#f1f5f9', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={14} color="#10b981" /> {item.name}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{formatDate(item.date)}</td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{item.uploadedBy}</td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1', fontWeight: 600 }}>{item.records.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8' }}>v{item.version}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: item.status === 'Active' ? 'rgba(16,185,129,0.15)' : item.status === 'Superseded' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)',
                      color: item.status === 'Active' ? '#10b981' : item.status === 'Superseded' ? '#f59e0b' : '#94a3b8',
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button title="Download" style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Download size={12} color="#94a3b8" />
                      </button>
                      <button title="Delete" style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No datasets match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                background: 'none', border: '1px solid #334155', borderRadius: '8px',
                padding: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronLeft size={14} color="#94a3b8" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  border: currentPage === i + 1 ? '1px solid #3b82f6' : '1px solid #334155',
                  backgroundColor: currentPage === i + 1 ? '#3b82f620' : 'transparent',
                  color: currentPage === i + 1 ? '#3b82f6' : '#94a3b8',
                  fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                background: 'none', border: '1px solid #334155', borderRadius: '8px',
                padding: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronRight size={14} color="#94a3b8" />
            </button>
          </div>
        )}
      </div>

      {/* CONFIRM DIALOG */}
      {showConfirmDialog && (
        <DialogOverlay onClose={() => setShowConfirmDialog(false)}>
          <div className="animate-slide-up" style={{
            backgroundColor: '#1e293b', borderRadius: '14px', border: '1px solid #334155',
            padding: '32px', width: '100%', maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#f59e0b" />
              <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '18px', fontWeight: 700 }}>Confirm Dataset Replacement</h3>
            </div>
            <p style={{ margin: '0 0 20px 0', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              Uploading <strong style={{ color: '#f1f5f9' }}>{uploadedFile?.name}</strong> will replace the current active dataset. This will trigger AI model retraining and update all analytics. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirmDialog(false)} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid #334155',
                backgroundColor: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={executeProcessing} className="btn-glow" style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: 700, fontSize: '13px',
                boxShadow: '0 4px 15px rgba(16,185,129,0.4)', cursor: 'pointer',
              }}>Confirm & Process</button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* ROLLBACK DIALOG */}
      {showRollbackDialog && (
        <DialogOverlay onClose={() => setShowRollbackDialog(false)}>
          <div className="animate-slide-up" style={{
            backgroundColor: '#1e293b', borderRadius: '14px', border: '1px solid #334155',
            padding: '32px', width: '100%', maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <RotateCcw size={24} color="#ef4444" />
              <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '18px', fontWeight: 700 }}>Rollback Previous Dataset</h3>
            </div>
            <p style={{ margin: '0 0 20px 0', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              This will revert the wildlife conflict database to the previous dataset version. The current dataset and any unsaved changes will be lost.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRollbackDialog(false)} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid #334155',
                backgroundColor: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleRollback} className="btn-danger-glow" style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff', fontWeight: 700, fontSize: '13px',
                boxShadow: '0 4px 15px rgba(239,68,68,0.4)', cursor: 'pointer',
              }}>Rollback</button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* PREVIEW DIALOG */}
      {showPreview && (
        <DialogOverlay onClose={() => setShowPreview(false)}>
          <div className="animate-slide-up" style={{
            backgroundColor: '#1e293b', borderRadius: '14px', border: '1px solid #334155',
            padding: '24px', width: '100%', maxWidth: '700px', maxHeight: '80vh', overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#06b6d4" /> Dataset Preview
              </h3>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '13px' }}>
              {uploadedFile?.name} — {datasetStats?.totalRecords?.toLocaleString()} records — {datasetStats?.speciesDetected} species detected
            </p>
            <div style={{ backgroundColor: '#0f172a', borderRadius: '10px', padding: '16px', border: '1px solid #334155', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    {['Date', 'Species', 'Location', 'Conflict Type', 'Severity', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(datasetStats?.speciesList || selectedPark.speciesList.slice(0, 3)).map((sp, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>2025-01-{15 + i}</td>
                      <td style={{ padding: '8px 10px', color: '#f1f5f9', fontWeight: 500 }}>{sp}</td>
                      <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>Zone {i + 1}</td>
                      <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>{['Crop Raiding', 'Corridor Blockage', 'Livestock Attack'][i % 3]}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: ['rgba(239,68,68,0.15)', 'rgba(245,158,11,0.15)', 'rgba(16,185,129,0.15)'][i % 3],
                          color: ['#ef4444', '#f59e0b', '#10b981'][i % 3],
                        }}>{['High', 'Medium', 'Low'][i % 3]}</span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{['Resolved', 'Open', 'In Progress'][i % 3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogOverlay>
      )}
    </div>
  );
};

/* ---------- Sub-components ---------- */

const ValidationCard = ({ label, value, passed, detail }) => (
  <div style={{
    padding: '12px 14px', borderRadius: '10px',
    backgroundColor: '#0f172a',
    border: `1px solid ${passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
  }}>
    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {passed ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
      <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600 }}>{value}</span>
    </div>
    {detail && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{detail}</div>}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="hover-elevate" style={{
    backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px',
    border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px',
  }}>
    <div style={{
      backgroundColor: `${color}20`, padding: '10px', borderRadius: '8px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '15px', color: '#f1f5f9', fontWeight: 700, marginTop: '2px' }}>{value}</div>
    </div>
  </div>
);

const SuccessStat = ({ label, value, color }) => (
  <div style={{
    padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a',
    border: `1px solid ${color}30`, textAlign: 'center',
  }}>
    <div style={{ fontSize: '20px', fontWeight: 700, color }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
  </div>
);

const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <button onClick={onClick} className="hover-scale" style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 18px', borderRadius: '10px',
    border: `1px solid ${color}40`,
    backgroundColor: `${color}10`,
    color: color, fontWeight: 600, fontSize: '13px',
    cursor: 'pointer', transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  }}>
    <Icon size={15} /> {label}
  </button>
);

const DialogOverlay = ({ children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}
  >
    <div onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default DatasetManagement;
