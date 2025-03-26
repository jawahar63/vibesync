import { Component } from '@angular/core';
import { MusicService } from '../../services/music.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import * as mm from 'music-metadata-browser';


@Component({
  selector: 'app-upload',
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  selectedAudioFile: File | null = null;
  selectedImageFile: File | null = null;
  uploadMessage: string = "";
  isUploading: boolean = false;
  metadata: any = {}; // Store extracted metadata

  constructor(private musicService: MusicService, public authService: AuthService) {}

  // Handle file selection
  async onFileSelect(event: any, fileType: 'audio' | 'image') {
    const file = event.target.files[0];

    if (fileType === 'audio') {
      this.selectedAudioFile = file;

      await this.extractMetadata(file);
    } else if (fileType === 'image') {
      this.selectedImageFile = file;
    }
  }
  async extractMetadata(file: File) {
    try {
      const metadata = await mm.parseBlob(file);
      this.metadata = {
        title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""), // Use file name if no title
        artist: metadata.common.artist || "Unknown Artist",
        album: metadata.common.album || "Unknown Album",
        genre: metadata.common.genre ? metadata.common.genre.join(", ") : "Unknown",
        picture: metadata.common.picture?.length
          ? metadata.common.picture[0].data
          : null
      };
      console.log("Extracted metadata:", this.metadata);
    } catch (error) {
      console.error("Metadata extraction failed:", error);
      this.metadata = {};
    }
  }


  uploadFiles() {
    if (!this.selectedAudioFile) {
      this.uploadMessage = "Please select an audio file.";
      return;
    }

    const formData = new FormData();
    formData.append('audioFile', this.selectedAudioFile);

    if (this.selectedImageFile) {
      formData.append('imageFile', this.selectedImageFile);
    }


    formData.append('title', this.metadata.title || this.selectedAudioFile.name);
    formData.append('artist', this.metadata.artist || "Unknown");
    formData.append('album', this.metadata.album || "Unknown");
    formData.append('genre', this.metadata.genre || "Unknown");
    

    if (this.metadata.picture) {
      const imageBlob = new Blob([this.metadata.picture], { type: 'image/jpeg' });
      formData.append('picture', imageBlob, 'cover.jpg');
    }

    this.isUploading = true;
    this.uploadMessage = "Uploading...";

    this.musicService.uploadSongs(formData).subscribe({
      next: (response) => {
        this.uploadMessage = "Upload successful!";
        console.log(response);
        this.resetForm();
      },
      error: (error) => {
        this.uploadMessage = "Upload failed. Please try again.";
        console.error(error);
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  resetForm() {
    this.selectedAudioFile = null;
    this.selectedImageFile = null;
    this.metadata = {};
    (document.getElementById('audioInput') as HTMLInputElement).value = "";
    (document.getElementById('imageInput') as HTMLInputElement).value = "";
  }
}
