from django.db import models
from .meeting import Meeting
from pydantic import BaseModel
from datetime import datetime


class NoteSchema(BaseModel):
    meeting_id: int
    content: str
    created_at: datetime
    updated_at: datetime


class Note(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Note for {self.meeting.title}"

    def serialize(self) -> NoteSchema:
        return NoteSchema(
            meeting_id=self.meeting.pk,
            content=self.content,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def create_note(cls, note_details: NoteSchema) -> "Note":
        note = cls(
            meeting=Meeting.objects.get(pk=note_details.meeting_id),
            content=note_details.content,
        )
        note.save()
        return note

    @classmethod
    def get_note(cls, meeting_id: int) -> "Note":
        return cls.objects.get_or_create(meeting_id=meeting_id)[0]

    def update_note(self, content: str) -> "Note":
        self.content = content
        self.save()
        return self
