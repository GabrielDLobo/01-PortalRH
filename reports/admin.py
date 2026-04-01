from django.contrib import admin
from django.utils.html import format_html
from .models import (
    ReportCategory, ReportTemplate, ReportExecution,
    ReportSchedule, ReportBookmark
)


@admin.register(ReportCategory)
class ReportCategoryAdmin(admin.ModelAdmin):
    """Admin interface for ReportCategory"""
    list_display = ['name', 'description', 'color_badge', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['is_active']
    ordering = ['name']

    def color_badge(self, obj):
        """Display color as badge"""
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px;">{}</span>',
            obj.color,
            obj.color
        )
    color_badge.short_description = 'Color'


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    """Admin interface for ReportTemplate"""
    list_display = [
        'name', 'report_type', 'category', 'default_format',
        'is_public', 'is_active', 'created_by', 'version', 'created_at'
    ]
    list_filter = [
        'report_type', 'category', 'default_format', 'is_public',
        'is_active', 'created_at', 'created_by'
    ]
    search_fields = ['name', 'description', 'created_by__username']
    list_editable = ['is_active', 'is_public']
    readonly_fields = ['id', 'created_at', 'updated_at', 'cache_key']
    filter_horizontal = ['allowed_users']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'report_type', 'category')
        }),
        ('Configuration', {
            'fields': (
                'query_config', 'output_formats', 'default_format',
                'columns_config', 'chart_config'
            )
        }),
        ('Permissions', {
            'fields': ('is_public', 'allowed_users', 'allowed_roles')
        }),
        ('Cache Settings', {
            'fields': ('enable_cache', 'cache_duration')
        }),
        ('Metadata', {
            'fields': ('created_by', 'is_active', 'version'),
            'classes': ('collapse',)
        }),
        ('System Info', {
            'fields': ('id', 'cache_key', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        """Set created_by when creating new template"""
        if not change:  # Only on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ReportExecution)
class ReportExecutionAdmin(admin.ModelAdmin):
    """Admin interface for ReportExecution"""
    list_display = [
        'template', 'executed_by', 'status', 'output_format',
        'execution_time_seconds', 'rows_processed', 'created_at'
    ]
    list_filter = [
        'status', 'output_format', 'template__report_type',
        'created_at', 'executed_by'
    ]
    search_fields = [
        'template__name', 'executed_by__username',
        'executed_by__first_name', 'executed_by__last_name'
    ]
    readonly_fields = [
        'id', 'template', 'executed_by', 'status', 'result_data',
        'file_path', 'execution_time_seconds', 'rows_processed',
        'error_message', 'started_at', 'completed_at', 'created_at',
        'updated_at', 'expires_at', 'is_expired', 'cache_key'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Execution Info', {
            'fields': ('template', 'executed_by', 'parameters', 'output_format')
        }),
        ('Status & Results', {
            'fields': ('status', 'result_data', 'file_path', 'error_message')
        }),
        ('Metrics', {
            'fields': (
                'execution_time_seconds', 'rows_processed',
                'started_at', 'completed_at'
            )
        }),
        ('File Management', {
            'fields': ('expires_at', 'is_expired'),
            'classes': ('collapse',)
        }),
        ('System Info', {
            'fields': ('id', 'cache_key', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        """Disable manual creation of executions"""
        return False

    def has_change_permission(self, request, obj=None):
        """Make executions read-only"""
        return False


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    """Admin interface for ReportSchedule"""
    list_display = [
        'name', 'template', 'frequency', 'status', 'success_rate_display',
        'next_execution', 'created_by', 'created_at'
    ]
    list_filter = [
        'frequency', 'status', 'template__report_type',
        'created_at', 'created_by'
    ]
    search_fields = [
        'name', 'template__name', 'created_by__username'
    ]
    readonly_fields = [
        'id', 'last_execution', 'next_execution', 'execution_count',
        'success_count', 'failure_count', 'success_rate',
        'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'template', 'status')
        }),
        ('Schedule Configuration', {
            'fields': ('frequency', 'cron_expression')
        }),
        ('Execution Configuration', {
            'fields': ('output_format', 'parameters')
        }),
        ('Notifications', {
            'fields': (
                'email_recipients', 'send_email_on_success',
                'send_email_on_failure'
            )
        }),
        ('Statistics', {
            'fields': (
                'last_execution', 'next_execution', 'execution_count',
                'success_count', 'failure_count', 'success_rate'
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def success_rate_display(self, obj):
        """Display success rate as percentage"""
        rate = obj.success_rate
        if rate >= 90:
            color = 'green'
        elif rate >= 70:
            color = 'orange'
        else:
            color = 'red'

        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color,
            rate
        )
    success_rate_display.short_description = 'Success Rate'

    def save_model(self, request, obj, form, change):
        """Set created_by when creating new schedule"""
        if not change:  # Only on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ReportBookmark)
class ReportBookmarkAdmin(admin.ModelAdmin):
    """Admin interface for ReportBookmark"""
    list_display = [
        'display_name', 'user', 'template', 'template_type',
        'created_at', 'updated_at'
    ]
    list_filter = [
        'template__report_type', 'created_at', 'user'
    ]
    search_fields = [
        'name', 'user__username', 'template__name',
        'user__first_name', 'user__last_name'
    ]
    readonly_fields = ['created_at', 'updated_at']

    def display_name(self, obj):
        """Display bookmark name or template name"""
        return obj.name or obj.template.name
    display_name.short_description = 'Bookmark Name'

    def template_type(self, obj):
        """Display template type"""
        return obj.template.get_report_type_display()
    template_type.short_description = 'Report Type'


# Admin site customization
admin.site.site_header = "Portal RH - Relatórios"
admin.site.site_title = "Portal RH Relatórios"
admin.site.index_title = "Administração de Relatórios"
