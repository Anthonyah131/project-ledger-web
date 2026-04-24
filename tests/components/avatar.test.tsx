import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";

describe("avatar", () => {
  it("should render avatar", () => {
    render(<Avatar data-testid="avatar">Avatar</Avatar>);
    expect(screen.getByText("Avatar")).toBeDefined();
  });

  it("should render avatar with default size", () => {
    const { container } = render(<Avatar>Avatar</Avatar>);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar?.getAttribute("data-size")).toBe("default");
  });

  it("should render avatar with sm size", () => {
    const { container } = render(<Avatar size="sm">Avatar</Avatar>);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar?.getAttribute("data-size")).toBe("sm");
  });

  it("should render avatar with lg size", () => {
    const { container } = render(<Avatar size="lg">Avatar</Avatar>);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar?.getAttribute("data-size")).toBe("lg");
  });

  it("should render avatar image", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="test.jpg" alt="Test" />
      </Avatar>
    );
    expect(container.querySelector('[data-slot="avatar-image"]')).toBeDefined();
  });

  it("should render avatar fallback", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeDefined();
    expect(screen.getByText("AB")).toBeDefined();
  });

  it("should render avatar badge", () => {
    const { container } = render(
      <Avatar>
        <AvatarBadge>+</AvatarBadge>
      </Avatar>
    );
    expect(container.querySelector('[data-slot="avatar-badge"]')).toBeDefined();
  });

  it("should render avatar group", () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar>1</Avatar>
        <Avatar>2</Avatar>
      </AvatarGroup>
    );
    expect(container.querySelector('[data-slot="avatar-group"]')).toBeDefined();
  });

  it("should render avatar group count", () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar>1</Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    );
    expect(container.querySelector('[data-slot="avatar-group-count"]')).toBeDefined();
    expect(screen.getByText("+3")).toBeDefined();
  });

  it("should render multiple avatars in group", () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar>1</Avatar>
        <Avatar>2</Avatar>
      </AvatarGroup>
    );
    expect(container.querySelectorAll('[data-slot="avatar"]').length).toBe(2);
  });
});