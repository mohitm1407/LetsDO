"""alarmclock URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from authenticator.views import LoginView, SignUpView
from task_manager.views import ProjectListView, AddTaskView, AddProjectView, TaskListView, EditTaskView
from note_manager.views import (
    NewMeetingView,
    MeetingNoteView,
    EditNoteView,
    UserMeetingsView,
    LinkTasksView,
    MeetingDetailsView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("login/", LoginView.as_view(), name="login"),
    path("signup/", SignUpView.as_view(), name="signup"),
    path("projects/<int:user_id>/", ProjectListView.as_view(), name="project_view"),
    path("projects/<int:project_id>/add_task/", AddTaskView.as_view(), name="add_task"),
    path("projects/create/", AddProjectView.as_view(), name="add_project"),
    path("meetings/create/", NewMeetingView.as_view(), name="new_meeting"),
    path("meetings/<int:meeting_id>/note/", MeetingNoteView.as_view(), name="meeting_note"),
    path("meetings/<int:meeting_id>/note/edit/", EditNoteView.as_view(), name="edit_note"),
    path("meetings/", UserMeetingsView.as_view(), name="user_meetings"),
    path("meetings/<int:meeting_id>/add_task/", LinkTasksView.as_view(), name="add_task"),
    path("meetings/<int:meeting_id>/", MeetingDetailsView.as_view(), name="meeting_details"),
    path("tasks/<int:user_id>/", TaskListView.as_view(), name="task_view"),
    path("tasks/<int:task_id>/edit/", EditTaskView.as_view(), name="edit_task"),
]
