from django.db import models
from pydantic import BaseModel
from datetime import datetime, time
from task_manager.models.project_task import ProjectTask


class MeetingSchema(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    tasks: list[int]


class Meeting(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    tasks = models.ManyToManyField(ProjectTask, related_name="meetings")

    def __str__(self) -> str:
        return self.title

    def serialize(self) -> MeetingSchema:
        return MeetingSchema(
            title=self.title,
            description=self.description,
            start_time=self.start_time,
            end_time=self.end_time,
            tasks=[task.pk for task in self.tasks.all()],
        )

    @classmethod
    def create_meeting(cls, meeting_details: MeetingSchema) -> "Meeting":
        meeting = cls(
            title=meeting_details.title,
            description=meeting_details.description,
            start_time=meeting_details.start_time,
            end_time=meeting_details.end_time,
        )
        tasks = ProjectTask.objects.filter(id__in=meeting_details.tasks)
        meeting.tasks.set(tasks)
        meeting.save()
        return meeting

    @classmethod
    def get_meeting(cls, meeting_id: int) -> "Meeting":
        return cls.objects.get(id=meeting_id)
