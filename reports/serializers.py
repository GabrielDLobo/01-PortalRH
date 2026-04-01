from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ReportCategory, ReportTemplate, ReportExecution,
    ReportSchedule, ReportBookmark
)
from typing import Dict, Any, List

User = get_user_model()


class ReportCategorySerializer(serializers.ModelSerializer):
    """Serializer for ReportCategory model"""

    class Meta:
        model = ReportCategory
        fields = [
            'id', 'name', 'description', 'icon', 'color',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReportTemplateListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing report templates"""

    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    execution_count = serializers.SerializerMethodField()

    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type', 'report_type_display',
            'category', 'category_name', 'default_format', 'is_public',
            'is_active', 'created_by', 'created_by_name', 'created_at',
            'updated_at', 'version', 'execution_count'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'category_name',
            'created_by_name', 'report_type_display', 'execution_count'
        ]

    def get_execution_count(self, obj) -> int:
        """Get the number of executions for this template"""
        return obj.executions.count()


class ReportTemplateDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for report templates"""

    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    allowed_users_details = serializers.SerializerMethodField()
    recent_executions = serializers.SerializerMethodField()

    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type', 'report_type_display',
            'category', 'category_name', 'query_config', 'output_formats',
            'default_format', 'columns_config', 'chart_config', 'is_public',
            'allowed_users', 'allowed_users_details', 'allowed_roles',
            'cache_duration', 'enable_cache', 'created_by', 'created_by_name',
            'is_active', 'version', 'created_at', 'updated_at', 'recent_executions'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'category_name',
            'created_by_name', 'report_type_display', 'allowed_users_details',
            'recent_executions'
        ]

    def get_allowed_users_details(self, obj) -> List[Dict[str, Any]]:
        """Get details of allowed users"""
        return [
            {
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name(),
                'email': user.email
            }
            for user in obj.allowed_users.all()
        ]

    def get_recent_executions(self, obj) -> List[Dict[str, Any]]:
        """Get recent executions for this template"""
        recent = obj.executions.all()[:5]
        return [
            {
                'id': str(execution.id),
                'status': execution.status,
                'executed_by': execution.executed_by.get_full_name(),
                'created_at': execution.created_at,
                'execution_time_seconds': execution.execution_time_seconds
            }
            for execution in recent
        ]


class ReportTemplateCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating report templates"""

    class Meta:
        model = ReportTemplate
        fields = [
            'name', 'description', 'report_type', 'category',
            'query_config', 'output_formats', 'default_format',
            'columns_config', 'chart_config', 'is_public',
            'allowed_users', 'allowed_roles', 'cache_duration',
            'enable_cache', 'is_active'
        ]

    def validate_output_formats(self, value):
        """Validate output formats"""
        valid_formats = ['json', 'pdf', 'excel', 'csv']
        if not isinstance(value, list):
            raise serializers.ValidationError("Output formats must be a list")

        for format_type in value:
            if format_type not in valid_formats:
                raise serializers.ValidationError(f"Invalid format: {format_type}")

        return value

    def validate_allowed_roles(self, value):
        """Validate allowed roles"""
        valid_roles = ['admin', 'rh', 'gestor', 'funcionario']
        if not isinstance(value, list):
            raise serializers.ValidationError("Allowed roles must be a list")

        for role in value:
            if role not in valid_roles:
                raise serializers.ValidationError(f"Invalid role: {role}")

        return value

    def create(self, validated_data):
        """Create a new report template"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ReportExecutionSerializer(serializers.ModelSerializer):
    """Serializer for ReportExecution model"""

    template_name = serializers.CharField(source='template.name', read_only=True)
    executed_by_name = serializers.CharField(source='executed_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    output_format_display = serializers.CharField(source='get_output_format_display', read_only=True)

    class Meta:
        model = ReportExecution
        fields = [
            'id', 'template', 'template_name', 'executed_by', 'executed_by_name',
            'parameters', 'output_format', 'output_format_display', 'status',
            'status_display', 'result_data', 'file_path', 'execution_time_seconds',
            'rows_processed', 'error_message', 'started_at', 'completed_at',
            'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = [
            'id', 'template_name', 'executed_by_name', 'status_display',
            'output_format_display', 'result_data', 'file_path',
            'execution_time_seconds', 'rows_processed', 'error_message',
            'started_at', 'completed_at', 'created_at', 'updated_at', 'expires_at'
        ]


class ReportExecutionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new report executions"""

    class Meta:
        model = ReportExecution
        fields = ['template', 'parameters', 'output_format']

    def create(self, validated_data):
        """Create a new report execution"""
        validated_data['executed_by'] = self.context['request'].user
        return super().create(validated_data)


class ReportScheduleSerializer(serializers.ModelSerializer):
    """Serializer for ReportSchedule model"""

    template_name = serializers.CharField(source='template.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    output_format_display = serializers.CharField(source='get_output_format_display', read_only=True)
    success_rate = serializers.ReadOnlyField()

    class Meta:
        model = ReportSchedule
        fields = [
            'id', 'name', 'template', 'template_name', 'frequency',
            'frequency_display', 'cron_expression', 'output_format',
            'output_format_display', 'parameters', 'email_recipients',
            'send_email_on_success', 'send_email_on_failure', 'status',
            'status_display', 'last_execution', 'next_execution',
            'execution_count', 'success_count', 'failure_count',
            'success_rate', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'template_name', 'created_by_name', 'frequency_display',
            'status_display', 'output_format_display', 'last_execution',
            'next_execution', 'execution_count', 'success_count',
            'failure_count', 'success_rate', 'created_at', 'updated_at'
        ]

    def validate_email_recipients(self, value):
        """Validate email recipients"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Email recipients must be a list")

        # Validate email format
        email_serializer = serializers.EmailField()
        for email in value:
            try:
                email_serializer.run_validation(email)
            except serializers.ValidationError:
                raise serializers.ValidationError(f"Invalid email format: {email}")

        return value

    def create(self, validated_data):
        """Create a new report schedule"""
        validated_data['created_by'] = self.context['request'].user
        schedule = super().create(validated_data)

        # Calculate initial next execution
        schedule.next_execution = schedule.calculate_next_execution()
        schedule.save(update_fields=['next_execution'])

        return schedule


class ReportBookmarkSerializer(serializers.ModelSerializer):
    """Serializer for ReportBookmark model"""

    template_name = serializers.CharField(source='template.name', read_only=True)
    template_type = serializers.CharField(source='template.report_type', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ReportBookmark
        fields = [
            'id', 'user', 'user_name', 'template', 'template_name',
            'template_type', 'name', 'parameters', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_name', 'template_name',
            'template_type', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        """Create a new report bookmark"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DashboardSummarySerializer(serializers.Serializer):
    """Serializer for dashboard summary data"""

    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    pending_admissions = serializers.IntegerField()
    recent_terminations = serializers.IntegerField()
    pending_leave_requests = serializers.IntegerField()
    pending_evaluations = serializers.IntegerField()

    # Charts data
    employees_by_department = serializers.ListField(
        child=serializers.DictField()
    )
    terminations_by_month = serializers.ListField(
        child=serializers.DictField()
    )
    leave_requests_by_status = serializers.ListField(
        child=serializers.DictField()
    )

    # Recent activities
    recent_activities = serializers.ListField(
        child=serializers.DictField()
    )


class ReportFilterSerializer(serializers.Serializer):
    """Serializer for report filters"""

    # Date filters
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)

    # Employee filters
    department = serializers.CharField(required=False, allow_blank=True)
    position = serializers.CharField(required=False, allow_blank=True)
    employee_status = serializers.CharField(required=False, allow_blank=True)

    # Pagination
    page = serializers.IntegerField(required=False, min_value=1)
    page_size = serializers.IntegerField(required=False, min_value=1, max_value=100)

    # Ordering
    ordering = serializers.CharField(required=False, allow_blank=True)

    # Format
    format = serializers.ChoiceField(
        choices=['json', 'pdf', 'excel', 'csv'],
        required=False,
        default='json'
    )

    def validate(self, data):
        """Validate date range"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                "Start date must be before end date"
            )

        return data


class ReportExportSerializer(serializers.Serializer):
    """Serializer for report export requests"""

    format = serializers.ChoiceField(
        choices=['pdf', 'excel', 'csv'],
        required=True
    )
    include_charts = serializers.BooleanField(default=False)
    email_to = serializers.EmailField(required=False)
    filename = serializers.CharField(required=False, max_length=255)

    def validate_filename(self, value):
        """Validate filename"""
        if value:
            # Remove potentially dangerous characters
            import re
            value = re.sub(r'[<>:"/\\|?*]', '_', value)
            if not value.endswith(('.pdf', '.xlsx', '.csv')):
                # Don't add extension here, it will be added based on format
                pass
        return value