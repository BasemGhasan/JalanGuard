"""
Reports Router
Handles road defect report CRUD operations
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from math import ceil

from app.core import get_db, get_current_user_id
from app.models import (
    Report, 
    ReportImage,
    ReportCreate, 
    ReportUpdate, 
    ReportResponse, 
    PaginatedReports,
    ReportStatus,
    DefectCategory,
    APIResponse
)
from app.models.schemas import ReportImageResponse

router = APIRouter()


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new road defect report.
    
    Args:
        report_data: Report creation data
        current_user_id: ID of authenticated user
        db: Database session
        
    Returns:
        Created report data
    """
    # Create report
    new_report = Report(
        user_id=current_user_id,
        category=report_data.category,
        description=report_data.description,
        latitude=report_data.location.latitude,
        longitude=report_data.location.longitude,
        address=report_data.address,
        status=ReportStatus.PENDING,
    )
    
    db.add(new_report)
    db.flush()  # Get the report ID without committing
    
    # Add images
    for image_uri in report_data.images:
        report_image = ReportImage(
            report_id=new_report.id,
            uri=image_uri,
        )
        db.add(report_image)
    
    db.commit()
    db.refresh(new_report)
    
    # TODO: Trigger AI detection in background
    
    return _report_to_response(new_report)


@router.get("/", response_model=PaginatedReports)
async def get_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ReportStatus] = None,
    category: Optional[DefectCategory] = None,
    db: Session = Depends(get_db)
):
    """
    Get paginated list of reports with optional filters.
    
    Args:
        page: Page number
        page_size: Items per page
        status: Filter by status
        category: Filter by category
        db: Database session
        
    Returns:
        Paginated reports
    """
    query = db.query(Report)
    
    # Apply filters
    if status:
        query = query.filter(Report.status == status)
    if category:
        query = query.filter(Report.category == category)
    
    # Get total count
    total = query.count()
    total_pages = ceil(total / page_size)
    
    # Paginate
    reports = query.order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return PaginatedReports(
        data=[_report_to_response(r) for r in reports],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/me", response_model=PaginatedReports)
async def get_my_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get reports submitted by current user.
    
    Returns:
        Paginated user reports
    """
    query = db.query(Report).filter(Report.user_id == current_user_id)
    
    total = query.count()
    total_pages = ceil(total / page_size)
    
    reports = query.order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return PaginatedReports(
        data=[_report_to_response(r) for r in reports],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str, db: Session = Depends(get_db)):
    """
    Get a single report by ID.
    
    Args:
        report_id: Report ID
        db: Database session
        
    Returns:
        Report data
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return _report_to_response(report)


@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    updates: ReportUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update a report.
    
    Args:
        report_id: Report ID
        updates: Fields to update
        db: Database session
        
    Returns:
        Updated report data
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Only allow owner to update description
    if report.user_id != current_user_id and updates.description is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this report"
        )
    
    # Apply updates
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    
    return _report_to_response(report)


@router.delete("/{report_id}", response_model=APIResponse)
async def delete_report(
    report_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a report.
    
    Args:
        report_id: Report ID
        db: Database session
        
    Returns:
        Success message
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if report.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this report"
        )
    
    db.delete(report)
    db.commit()
    
    return APIResponse(success=True, message="Report deleted successfully")


def _report_to_response(report: Report) -> ReportResponse:
    """Convert database report to response model"""
    from app.models.schemas import Coordinates, AIDetectionResult
    
    return ReportResponse(
        id=report.id,
        user_id=report.user_id,
        category=report.category,
        description=report.description,
        location=Coordinates(latitude=report.latitude, longitude=report.longitude),
        address=report.address,
        images=[ReportImageResponse(id=img.id, uri=img.uri, thumbnail_uri=img.thumbnail_uri) for img in report.images],
        status=report.status,
        severity=report.severity,
        ai_detection_result=AIDetectionResult(**report.ai_detection_result) if report.ai_detection_result else None,
        created_at=report.created_at,
        updated_at=report.updated_at,
        resolved_at=report.resolved_at,
    )
