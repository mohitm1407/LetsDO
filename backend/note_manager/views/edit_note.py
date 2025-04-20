from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from note_manager.models.notes import Note, NoteSchema
from pydantic import BaseModel


class EditNoteSchema(BaseModel):
    content: str


class EditNoteView(APIView):

    def post(self, request, meeting_id: int) -> Response:
        try:
            meeting_note = Note.get_note(meeting_id=meeting_id)
            edited_note = EditNoteSchema.model_validate(request.data)
            meeting_note.update_note(edited_note.content)
            return Response(meeting_note.serialize(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
