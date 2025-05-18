from django.db import models
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from task_manager.models.project_task import ProjectTask


class MeetingSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    # Annotate as datetime but parse from ISO string
    start_time: str
    end_time: str
    tasks: List[dict] = Field(default_factory=dict)
    
    class Config:
        # Configure JSON schema to handle datetime conversion
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        # Allow parsing of ISO strings to datetime objects
        json_decoders = {
            datetime: datetime.fromisoformat
        }


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
            id=self.pk,
            title=self.title,
            description=self.description,
            start_time=self.start_time.isoformat(),
            end_time=self.end_time.isoformat(),
            tasks=[task.serialize().model_dump() for task in self.tasks.all()],
        )

    @classmethod
    def create_meeting(cls, meeting_details: MeetingSchema) -> "Meeting":
        meeting = cls(
            title=meeting_details.title,
            description=meeting_details.description,
            start_time=datetime.fromisoformat(meeting_details.start_time),
            end_time=datetime.fromisoformat(meeting_details.end_time),
        )
        meeting.save()
        if meeting_details.tasks:
            tasks = ProjectTask.objects.filter(id__in=meeting_details.tasks)
            meeting.tasks.set(tasks)
        return meeting

    @classmethod
    def get_meeting(cls, meeting_id: int) -> "Meeting":
        return cls.objects.get(id=meeting_id)

    def link_tasks(self , task_ids: list[int]) -> None:
        try:
            tasks = list(ProjectTask.objects.filter(id__in=task_ids))
            self.tasks.clear()
            self.tasks.add(*tasks)
            self.save()
        except Exception as e:
            print(e)
            raise e

