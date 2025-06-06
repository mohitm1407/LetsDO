from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from note_manager.models.notes import Note, NoteSchema


class MeetingNoteView(APIView):

    def get(self, request, meeting_id: int) -> Response:
        try:
            meeting_note = Note.get_note(meeting_id=meeting_id)
            return Response(meeting_note.serialize().model_dump(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
